"""Assemble the audio layer and caption data.

  - picks the best-scoring VO take per line (Whisper vs script), places it on the beat plan
  - writes assets/audio/vo.wav, build/captions.json (word times from Whisper, words from the script)
  - ducks the code-composed score under the VO -> assets/audio/music.wav
  - converts the Kenney SFX it uses -> assets/sfx/*.wav and writes build/sfx_plan.json
  - writes build/premix.wav (VO + music + SFX) for a loudness check
"""
import difflib
import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, resample_poly, sosfilt

HERE = Path(__file__).resolve().parent
PROJ = HERE.parent
REPO = PROJ.parent.parent
SR = 48000
DUR = 45.0
N = int(DUR * SR)
BEAT = 60 / 112
HIT = [69 * BEAT, 71 * BEAT, 73 * BEAT]
TRANS = [4.62, 10.52, 14.55, 19.95, 29.75, 31.95, 33.75, 36.7, 40.95]

lines = {l["id"]: l for l in json.loads((HERE / "vo_lines.json").read_text())}
takes = json.loads((HERE / "takes_scored.json").read_text())

# target speech onset and hard end for every line
PLAN = {
    "s1a": (1.50, 4.55), "s2a": (5.10, 6.75), "s2b": (6.80, 8.40), "s2c": (8.45, 10.45),
    "s3a": (11.20, 12.70), "s3b": (12.75, 14.40), "s4a": (17.30, 19.90),
    "s5a": (20.80, 22.70), "s5b": (22.75, 24.20), "s5c": (24.25, 26.25), "s5d": (26.00, 27.40),
    "s6a": (30.15, 31.90), "s6b": (32.35, 33.70), "s6c": (34.00, 35.05), "s6d": (35.10, 36.65),
    "s7a": (HIT[0] - 0.04, HIT[1] - 0.06), "s7b": (HIT[1] - 0.04, HIT[2] - 0.06), "s7c": (HIT[2] - 0.04, 40.90),
    "s8a": (41.35, 42.40), "s8b": (42.45, 44.80),
}
NO_CAPTION = {"s7a", "s7b", "s7c", "s8a", "s8b"}  # the on-screen type IS the line there
KEY = {"p2p", "forty", "three", "zero", "you", "spenda", "naira", "stablecoins", "instantly", "statements", "dark", "two", "factor", "locked"}
OVERRIDE = json.loads((HERE / "take_override.json").read_text()) if (HERE / "take_override.json").exists() else {}

NUM = {"40": "forty", "3": "three", "0": "zero", "2": "two", "phi": "fee", "v0": "fee", "nuhwahala": "wahala"}


def norm(text):
    t = text.lower().replace("…", " ").replace("p-two-p", "p2p").replace("p to p", "p2p").replace("p two p", "p2p")
    t = t.replace("2.0", " two point oh ").replace("spender", "spenda").replace("stable coins", "stablecoins")
    t = re.sub(r"[^a-z0-9' ]+", " ", t.replace("-", " "))
    return [NUM.get(w, w) for w in t.split()]


def pick(lid):
    cands = [t for t in takes if t["id"] == lid]
    if lid in OVERRIDE:
        return next(t for t in cands if t["take"] == OVERRIDE[lid])
    start, end = PLAN[lid]
    slot = end - start
    def key(t):
        exp, got = norm(lines[lid]["say"]), norm(" ".join(w["w"] for w in t["words"]))
        s = difflib.SequenceMatcher(None, exp, got).ratio()
        fits = t["dur"] - 0.05 <= slot
        return (round(s, 2), fits, -t["dur"])
    return max(cands, key=key)


def load(path, sr_target=SR):
    x, sr = sf.read(path, always_2d=True)
    x = x.mean(1)
    if sr != sr_target:
        g = np.gcd(sr, sr_target)
        x = resample_poly(x, sr_target // g, sr // g)
    return x


def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x**2)) + 1e-12)


# ------------------------------------------------------------------ VO
vo = np.zeros(N)
captions, chosen = [], {}
hp = butter(2, 90, "high", fs=SR, output="sos")
for lid, (start, end) in PLAN.items():
    t = pick(lid)
    x = sosfilt(hp, load(HERE / t["file"]))
    # crop stray syllables ("um", "dot") outside the scripted words, using Whisper word times
    exp_tok = set(norm(lines[lid]["say"])) | set(norm(lines[lid]["show"]))
    hits = [w for w in t["words"] if any(tk in exp_tok for tk in norm(w["w"]))]
    c0 = max(0.0, hits[0]["start"] - 0.06) if hits else 0.0
    c1 = min(len(x) / SR, hits[-1]["end"] + 0.12) if hits else len(x) / SR
    x = x[int(c0 * SR) : int(c1 * SR)]
    f = int(0.008 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
    t = dict(t, dur=len(x) / SR, words=[dict(w, start=max(0.0, w["start"] - c0), end=max(0.0, w["end"] - c0)) for w in t["words"] if w["end"] > c0 + 0.02])
    speech = x[np.abs(x) > 0.02]
    x *= 10 ** ((-17.5 - rms_db(speech)) / 20)  # level-match every fragment
    tempo = 1.0
    if t["dur"] - 0.05 > end - start:
        tempo = min(1.15, (t["dur"] - 0.05) / (end - start - 0.02))
        tmp_in, tmp_out = HERE / "_tmp_in.wav", HERE / "_tmp_out.wav"
        sf.write(tmp_in, x.astype(np.float32), SR)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp_in), "-filter:a", f"atempo={tempo:.4f}", str(tmp_out)], check=True)
        x = load(tmp_out)
        tmp_in.unlink(); tmp_out.unlink()
    i0 = int(round((start - 0.06) * SR))
    seg = x[: max(0, N - i0)]
    vo[i0 : i0 + len(seg)] += seg
    chosen[lid] = {"take": t["take"], "text": t["text"], "start": start, "dur": len(x) / SR, "tempo": round(tempo, 3)}
    if lid in NO_CAPTION:
        continue
    # word timing: Whisper times, script words
    show = lines[lid]["show"].split()
    show_tok = [norm(w) for w in show]
    flat, owner = [], []
    for wi, toks in enumerate(show_tok):
        for tk in toks:
            flat.append(tk); owner.append(wi)
    wt, wtimes = [], []
    for w in t["words"]:
        for tk in norm(w["w"]):
            wt.append(tk); wtimes.append((w["start"], w["end"]))
    sm = difflib.SequenceMatcher(None, flat, wt)
    tok_time = [None] * len(flat)
    for a, b_, size in sm.get_matching_blocks():
        for k in range(size):
            tok_time[a + k] = wtimes[b_ + k]
    words = []
    for wi, w in enumerate(show):
        ts = [tok_time[k] for k in range(len(flat)) if owner[k] == wi and tok_time[k]]
        words.append({"w": w, "start": ts[0][0] if ts else None, "end": ts[-1][1] if ts else None,
                      "key": any(tk in KEY for tk in show_tok[wi])})
    # fill gaps by interpolation across the take
    first = next((w["start"] for w in words if w["start"] is not None), 0.05)
    last = next((w["end"] for w in reversed(words) if w["end"] is not None), t["dur"] - 0.05)
    for wi, w in enumerate(words):
        if w["start"] is None:
            prev_end = next((words[j]["end"] for j in range(wi - 1, -1, -1) if words[j]["end"] is not None), first)
            nxt = next((words[j]["start"] for j in range(wi + 1, len(words)) if words[j]["start"] is not None), last)
            w["start"], w["end"] = prev_end, max(prev_end + 0.05, nxt)
    off = start - 0.06
    for w in words:
        w["start"] = round(off + w["start"] / tempo, 3)
        w["end"] = round(off + w["end"] / tempo, 3)
    captions.append({"id": lid, "t0": round(words[0]["start"] - 0.04, 3), "t1": None, "words": words})

# caption exits: after the last word, before the next line and any transition
for i, c in enumerate(captions):
    last_end = c["words"][-1]["end"]
    limit = min([captions[i + 1]["t0"] - 0.04] if i + 1 < len(captions) else [DUR])
    limit = min([limit] + [x - 0.05 for x in TRANS if x > c["t0"]])
    c["t1"] = round(min(last_end + 0.45, limit), 3)
(HERE / "captions.json").write_text(json.dumps(captions, indent=1, ensure_ascii=False))
(HERE / "vo_chosen.json").write_text(json.dumps(chosen, indent=1))
peak = np.abs(vo).max()
vo *= min(1.0, 0.89 / peak)
(PROJ / "assets/audio").mkdir(parents=True, exist_ok=True)
sf.write(PROJ / "assets/audio/vo.wav", np.stack([vo, vo], 1).astype(np.float32), SR, subtype="PCM_24")

# ------------------------------------------------------------------ music: sidechain duck under the VO
mus, msr = sf.read(HERE / "music_raw.wav", always_2d=True)
assert msr == SR
env = np.abs(vo)
win = int(0.01 * SR)
env = np.sqrt(np.convolve(env**2, np.ones(win) / win, mode="same"))
look = int(0.06 * SR)
env = np.concatenate([env[look:], np.zeros(look)])  # look-ahead so the duck lands before the word
g = np.ones(N)
target = np.where(env > 0.012, 10 ** (-9.5 / 20), 1.0)
att, rel = np.exp(-1 / (0.025 * SR)), np.exp(-1 / (0.38 * SR))
cur = 1.0
for i in range(N):
    a = att if target[i] < cur else rel
    cur = a * cur + (1 - a) * target[i]
    g[i] = cur
mus = mus[:N] * g[:, None] * 10 ** (-2.5 / 20)
sf.write(PROJ / "assets/audio/music.wav", mus.astype(np.float32), SR, subtype="PCM_24")
np.save(HERE / "duck_gain.npy", g[:: SR // 100])

# ------------------------------------------------------------------ SFX on the beats (Kenney CC0)
S = REPO / "sfx"
CUES = [
    # S1 hook: message pops, ticks, glitches
    ("interface-sounds/drop_002", 0.36, 0.8), ("interface-sounds/pluck_001", 1.08, 0.7), ("interface-sounds/drop_003", 2.14, 0.8),
    ("interface-sounds/glitch_001", 0.36, 0.7), ("interface-sounds/glitch_003", 2.14, 0.7), ("interface-sounds/glitch_002", 3.30, 0.6),
    ("interface-sounds/glitch_004", 4.18, 0.8), ("digital-audio/zapTwoTone", 4.45, 0.35),
    ("interface-sounds/tick_002", 1 * BEAT, 0.45), ("interface-sounds/tick_002", 3 * BEAT, 0.45), ("interface-sounds/tick_002", 5 * BEAT, 0.45), ("interface-sounds/tick_002", 7 * BEAT, 0.5),
    # S2 pain: slams, glitches, shatters
    ("impact-sounds/impactPunch_heavy_002", 5.00, 0.75), ("interface-sounds/glitch_001", 5.00, 0.7),
    ("impact-sounds/impactPunch_heavy_000", 6.70, 0.75), ("interface-sounds/glitch_003", 6.70, 0.7),
    ("impact-sounds/impactPunch_heavy_003", 8.30, 0.75), ("interface-sounds/glitch_002", 8.30, 0.7),
    ("impact-sounds/impactGlass_light_000", 6.48, 0.8), ("impact-sounds/impactGlass_light_002", 8.08, 0.8), ("impact-sounds/impactGlass_medium_001", 10.02, 0.8),
    ("digital-audio/phaseJump1", 10.48, 0.35),
    # S3 break: crack, shatter, whoosh into the dark
    ("impact-sounds/impactGlass_heavy_000", 13.45, 1.0), ("interface-sounds/glass_004", 13.47, 0.6),
    ("sci-fi-sounds/explosionCrunch_000", 13.75, 0.7), ("impact-sounds/impactGlass_heavy_002", 13.76, 0.9),
    ("interface-sounds/maximize_001", 14.55 - 0.2, 0.55),
    # S4 reveal: deep impact on the landing, swish on the wordmark
    ("sci-fi-sounds/lowFrequency_explosion_001", 32 * BEAT, 0.9), ("impact-sounds/impactPunch_heavy_002", 32 * BEAT, 0.5),
    ("interface-sounds/maximize_003", 17.40 - 0.15, 0.5), ("interface-sounds/maximize_002", 19.95 - 0.2, 0.5),
    # S5 flow: taps, slides, coin jingle, success chime
    ("interface-sounds/click_002", 20.92, 0.8), ("ui-audio/switch12", 21.12, 0.6), ("interface-sounds/pluck_002", 22.42, 0.6),
    ("ui-audio/switch13", 22.72, 0.6), ("impact-sounds/impactBell_heavy_003", 23.30, 0.55), ("interface-sounds/pluck_001", 23.45, 0.6),
    ("impact-sounds/impactBell_heavy_002", 23.62, 0.4), ("interface-sounds/click_003", 24.16, 0.8), ("digital-audio/phaserUp2", 24.20, 0.35),
    ("interface-sounds/drop_004", 26.40, 0.8), ("interface-sounds/confirmation_002", 28.12, 0.9), ("interface-sounds/pluck_002", 28.22, 0.5),
    # S6 extras: whoosh per flip, clicks on taps and toggles, lock snap
    ("interface-sounds/maximize_002", 29.75 - 0.2, 0.6), ("interface-sounds/click_001", 30.86, 0.8), ("interface-sounds/pluck_001", 31.40, 0.6),
    ("interface-sounds/maximize_002", 31.95 - 0.2, 0.6), ("interface-sounds/toggle_002", 32.64, 0.9), ("interface-sounds/switch_003", 32.70, 0.5),
    ("interface-sounds/maximize_002", 33.75 - 0.2, 0.6),
    ("ui-audio/click4", 34.18, 0.35), ("ui-audio/click4", 34.38, 0.35), ("ui-audio/click4", 34.58, 0.35),
    ("sci-fi-sounds/doorClose_001", 35.33 - 0.53, 0.6), ("interface-sounds/click_004", 35.33, 0.9), ("impact-sounds/impactMetal_heavy_000", 35.33, 0.6),
    ("interface-sounds/maximize_001", 36.70 - 0.2, 0.5),
    # S7 punchline: heavy hits + glitch on the last word
    ("impact-sounds/impactPunch_heavy_000", HIT[0], 1.0), ("sci-fi-sounds/lowFrequency_explosion_000", HIT[0], 0.55),
    ("impact-sounds/impactPunch_heavy_002", HIT[1], 1.0), ("impact-sounds/impactMetal_heavy_001", HIT[1], 0.5),
    ("impact-sounds/impactPunch_heavy_003", HIT[2], 1.0), ("sci-fi-sounds/lowFrequency_explosion_001", HIT[2], 0.55),
    ("interface-sounds/glitch_001", HIT[2] + 0.12, 0.8), ("interface-sounds/glitch_003", HIT[2] + 0.2, 0.8), ("interface-sounds/glitch_002", HIT[2] + 0.72, 0.7),
    # S8 outro: soft riser in, shimmer on the glint
    ("REVERSE:impact-sounds/impactBell_heavy_001", None, 0.5),
    ("interface-sounds/glass_004", 42.0, 0.35), ("interface-sounds/tick_001", 43.15, 0.35),
]
(PROJ / "assets/sfx").mkdir(parents=True, exist_ok=True)
plan, sfx_mix = [], np.zeros(N)
for name, t, vol in CUES:
    rev = name.startswith("REVERSE:")
    src = name.split(":", 1)[1] if rev else name
    x = load(S / f"{src}.ogg")
    out_name = Path(src).name + ("_rev" if rev else "") + ".wav"
    if rev:
        x = x[::-1].copy()
        f = int(0.02 * SR); x[-f:] *= np.linspace(1, 0, f)
        t = 40.95 - len(x) / SR
    sf.write(PROJ / "assets/sfx" / out_name, np.stack([x, x], 1).astype(np.float32), SR, subtype="PCM_16")
    plan.append({"src": f"assets/sfx/{out_name}", "t": round(t, 3), "dur": round(len(x) / SR, 3), "vol": vol})
    i0 = int(t * SR)
    seg = x[: N - i0] * vol
    sfx_mix[i0 : i0 + len(seg)] += seg
(HERE / "sfx_plan.json").write_text(json.dumps(plan, indent=1))

pre = np.stack([vo, vo], 1) + mus + np.stack([sfx_mix, sfx_mix], 1)
sf.write(HERE / "premix.wav", pre.astype(np.float32), SR, subtype="FLOAT")
for lid, c in chosen.items():
    print(f"{lid}: take {c['take']} @ {c['start']:.2f}s dur {c['dur']:.2f}s tempo {c['tempo']}  '{c['text']}'")
print("captions", len(captions), "sfx", len(plan), "premix peak", round(float(np.abs(pre).max()), 3))
