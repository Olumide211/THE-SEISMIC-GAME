"""Trim every VO take, transcribe it with Whisper (word timestamps), and score it
against the script. Run with the whisper tool's interpreter:
  ~/.local/share/uv/tools/openai-whisper/bin/python build/score_takes.py
Writes build/takes_scored.json.
"""
import difflib
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
import whisper

HERE = Path(__file__).resolve().parent
TAKES = HERE / "vo_takes"
TRIM = HERE / "vo_trim"
TRIM.mkdir(exist_ok=True)
lines = {l["id"]: l for l in json.loads((HERE / "vo_lines.json").read_text())}


def norm_tokens(text):
    t = text.lower().replace("…", " ").replace("p-two-p", "p2p").replace("p to p", "p2p").replace("p two p", "p2p")
    t = t.replace("2.0", "two point oh").replace("two point o ", "two point oh ").replace("2fa", "two factor")
    t = re.sub(r"[^a-z0-9' ]+", " ", t.replace("-", " "))
    return t.split()


def trim(x, sr, thr_db=-42.0, pad=0.05):
    env = np.sqrt(np.convolve(x**2, np.ones(int(0.01 * sr)) / int(0.01 * sr), mode="same"))
    on = np.where(20 * np.log10(env + 1e-9) > thr_db)[0]
    if len(on) == 0:
        return x
    a = max(0, on[0] - int(pad * sr))
    b = min(len(x), on[-1] + int(pad * sr))
    return x[a:b]


model = whisper.load_model("small.en")
out = []
for f in sorted(TAKES.glob("*.wav")):
    lid, take = f.stem.rsplit("_", 1)
    x, sr = sf.read(f)
    if x.ndim > 1:
        x = x.mean(1)
    y = trim(x, sr)
    fade = int(0.01 * sr)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    tp = TRIM / f.name
    sf.write(tp, y.astype(np.float32), sr)
    r = model.transcribe(str(tp), word_timestamps=True, language="en", temperature=0.0,
                         initial_prompt="Spenda, Naira, stablecoins, wahala, P2P, two-factor, dark mode, statements.")
    words = [{"w": w["word"].strip(), "start": w["start"], "end": w["end"]} for s in r["segments"] for w in s["words"]]
    exp = norm_tokens(lines[lid]["say"])
    got = norm_tokens(" ".join(w["w"] for w in words))
    ratio = difflib.SequenceMatcher(None, exp, got).ratio()
    out.append({"id": lid, "take": take, "file": str(tp.relative_to(HERE)), "dur": len(y) / sr, "sr": sr,
                "text": r["text"].strip(), "score": round(ratio, 3), "words": words})
    print(f"{f.stem:8s} {len(y)/sr:5.2f}s score {ratio:.2f}  {r['text'].strip()}", flush=True)
(HERE / "takes_scored.json").write_text(json.dumps(out, indent=1))
