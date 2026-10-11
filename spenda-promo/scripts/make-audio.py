"""Synthesize the soundtrack + SFX for the Spenda promo (no samples, no licences).

    python3 scripts/make-audio.py      # writes public/*.mp3 (needs numpy + ffmpeg)

Music: tense ticking-clock intro (P2P chat) -> silence beat -> amapiano groove
(log drum, shaker, claps, Rhodes stabs) that drops on the Spenda logo at 6.4s
-> sustained outro chord under the end card.
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
DUR = 22.0
ROOT = os.path.join(os.path.dirname(__file__), "..", "public")
rng = np.random.default_rng(7)

BPM = 112
BEAT = 60 / BPM
STEP = BEAT / 4
DROP = 6.4  # beat grid starts on the logo reveal
OUTRO = 19.4


# ---------------------------------------------------------------- helpers
def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(sec, attack=0.002, decay=0.2):
    t = t_axis(sec)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def filt(x, lo=None, hi=None, order=2):
    """Zero-phase FFT band filter (butterworth-shaped magnitude)."""
    n = len(x)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    m = np.ones_like(fr)
    if hi:
        m *= 1 / np.sqrt(1 + (fr / hi) ** (2 * order))
    if lo:
        m *= 1 / np.sqrt(1 + (lo / np.maximum(fr, 1e-3)) ** (2 * order))
    return np.fft.irfft(X * m, n)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[1] or i + len(sig) <= 0:
        return
    j = min(buf.shape[1], i + len(sig))
    s = sig[: j - i] * gain
    buf[0, i:j] += s * np.sqrt(0.5 * (1 - pan))
    buf[1, i:j] += s * np.sqrt(0.5 * (1 + pan))


def note(n):  # MIDI -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- instruments
def kick(gain=1.0):
    t = t_axis(0.45)
    f = 48 + 70 * np.exp(-t / 0.03)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = filt(noise(0.45), lo=2000) * np.exp(-t / 0.004) * 0.25
    return (body + click) * gain


def log_drum(freq, dur=0.42):
    t = t_axis(dur)
    f = freq * (1 + 0.9 * np.exp(-t / 0.025))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    x *= np.minimum(1, t / 0.003) * np.exp(-t / 0.16)
    return np.tanh(2.6 * x) * 0.8


def shaker(accent=1.0):
    t = t_axis(0.09)
    return filt(noise(0.09), lo=6500) * np.exp(-t / 0.022) * 0.18 * accent


def clap():
    t = t_axis(0.35)
    n = filt(noise(0.35), lo=900, hi=4200)
    e = np.zeros_like(t)
    for k, d in enumerate([0, 0.009, 0.018]):
        e += np.where(t >= d, np.exp(-(t - d) / (0.006 if k < 2 else 0.11)), 0)
    return n * e * 0.45


def rhodes(freqs, dur=0.9, decay=0.45, bright=1.0):
    t = t_axis(dur)
    out = np.zeros_like(t)
    for fq in freqs:
        for h, a in [(1, 1.0), (2, 0.28 * bright), (3, 0.08 * bright), (7, 0.02 * bright)]:
            out += a * np.sin(2 * np.pi * fq * h * t + 0.3 * h) * np.exp(-t * h / (decay * 3))
        out += 0.35 * np.sin(2 * np.pi * fq * t) * np.exp(-t / decay)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 5.2 * t)
    return out * trem * np.minimum(1, t / 0.004) / max(1, len(freqs)) * 0.55


def pad(freqs, dur):
    t = t_axis(dur)
    out = np.zeros_like(t)
    for fq in freqs:
        for det in (-0.12, 0.12):
            out += np.sin(2 * np.pi * fq * (1 + det / 100) * t)
    a = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.4)
    return filt(out, hi=1800) * a / (2 * len(freqs)) * 0.25


def tick(hi=True):
    t = t_axis(0.06)
    f = 2400 if hi else 1800
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.008) + filt(noise(0.06), lo=3000) * np.exp(-t / 0.003) * 0.4) * 0.35


def riser(dur, lo=150, hi=1400):
    t = t_axis(dur)
    p = t / dur
    sweep = np.sin(2 * np.pi * np.cumsum(lo + (hi - lo) * p**2) / SR) * 0.15
    n = filt(noise(dur), lo=1500, hi=7000) * p**3 * 0.12
    return (sweep + n) * p


def sub_boom(dur=1.2, f0=42):
    t = t_axis(dur)
    return np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t / 0.05))) * np.exp(-t / 0.45) * 0.9


# Chords (MIDI): Am9, Fmaj9, Cmaj9, G6
PROG = [
    ([57, 60, 64, 67, 71], 45),
    ([53, 57, 60, 64, 67], 41),
    ([48, 52, 55, 59, 62], 36),
    ([55, 59, 62, 64, 67], 43),
]
LOG_STEPS = [0, 3, 6, 8, 11, 14]
LOG_OFFS = [0, 0, 7, 0, 12, 0]  # semitone offsets from the bass root
STAB_STEPS = [2, 7, 10, 15]


def music():
    buf = np.zeros((2, int(DUR * SR)))

    # --- intro: low drone + ticking clock (the waiting) ---
    t = t_axis(4.4)
    drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 55.4 * t) + 0.3 * np.sin(2 * np.pi * 82.4 * t))
    drone *= np.minimum(1, t / 0.8) * np.minimum(1, (4.4 - t) / 0.15) * 0.16
    place(buf, drone, 0, pan=0)
    for k, at in enumerate(np.arange(1.2, 4.4, 0.5)):
        place(buf, tick(k % 2 == 0), at, gain=1.0, pan=0.3 if k % 2 else -0.3)
    place(buf, riser(1.4, 120, 900), 3.0, gain=0.8)
    # "It's not you…" — one soft chord in the silence
    place(buf, rhodes([note(n) for n in [57, 60, 64]], dur=1.6, decay=0.7, bright=0.6), 4.45, gain=0.55)
    # shatter boom + reverse swell into the drop
    place(buf, sub_boom(), 5.5, gain=0.45)
    sw = filt(noise(0.6), lo=3000) * np.linspace(0, 1, int(0.6 * SR)) ** 3 * 0.35
    place(buf, sw, DROP - 0.6, pan=0)

    # --- groove: 6.4 → 19.4 ---
    bar = 16 * STEP
    nbars = int(np.ceil((OUTRO - DROP) / bar))
    for b in range(nbars):
        chord, bass = PROG[b % 4]
        t0 = DROP + b * bar
        place(buf, pad([note(chord[0] - 12), note(chord[2] - 12)], bar), t0, gain=1.0)
        for s in range(16):
            at = t0 + s * STEP
            if at >= OUTRO:
                break
            full = b >= 1  # first bar = logo reveal, lighter
            if s % 4 == 0:
                place(buf, kick(0.9 if full else 0.6), at)
            if full and s in (4, 12):
                place(buf, clap(), at, pan=-0.15)
                place(buf, clap() * 0.5, at + 0.012, pan=0.35)
            if full or s >= 8:
                place(buf, shaker(1.0 if s % 2 else 0.55), at, pan=0.4)
            if s in LOG_STEPS:
                i = LOG_STEPS.index(s)
                place(buf, log_drum(note(bass + LOG_OFFS[i] - 12)), at, gain=0.9)
            if s in STAB_STEPS:
                place(buf, rhodes([note(n) for n in chord], dur=0.7, decay=0.28), at, gain=0.7, pan=-0.2 if s % 2 else 0.2)

    # --- outro: big held chord under the end card ---
    chord, bass = PROG[0]
    place(buf, log_drum(note(bass - 12), dur=0.8), OUTRO, gain=1.0)
    place(buf, kick(1.0), OUTRO)
    place(buf, sub_boom(1.6, 55), OUTRO, gain=0.5)
    place(buf, rhodes([note(n) for n in chord + [76]], dur=2.6, decay=1.1), OUTRO, gain=0.9)
    place(buf, pad([note(chord[0] - 12), note(chord[2] - 12), note(chord[4])], 2.6), OUTRO, gain=1.4)
    for k in range(10):  # trailing shaker, fading
        place(buf, shaker(1 - k / 10), OUTRO + 0.3 + k * STEP * 2, pan=0.4)
    # sparkle on the tagline
    place(buf, rhodes([note(88), note(91)], dur=1.2, decay=0.5, bright=1.5), 20.5, gain=0.35, pan=0.3)

    # simple stereo room: short cross-fed delays
    for d, g in [(0.023, 0.18), (0.041, 0.12), (0.067, 0.08)]:
        n = int(d * SR)
        buf[0, n:] += buf[1, :-n] * g
        buf[1, n:] += buf[0, :-n] * g

    # fade the last 0.6s, master
    fade = np.ones(buf.shape[1])
    n = int(0.6 * SR)
    fade[-n:] = np.linspace(1, 0, n)
    buf *= fade
    buf = np.tanh(buf * 1.3)
    return buf / np.max(np.abs(buf)) * 0.89


# ---------------------------------------------------------------- SFX
def mono(x):
    return np.vstack([x, x])


def sfx_message():
    t = t_axis(0.18)
    x = np.sin(2 * np.pi * 1046 * t) * np.exp(-t / 0.04) * (t < 0.07)
    x += np.sin(2 * np.pi * 1568 * t) * np.exp(-np.maximum(t - 0.06, 0) / 0.05) * (t >= 0.06)
    return mono(x * 0.5)


def sfx_whoosh():
    d = 0.5
    t = t_axis(d)
    p = t / d
    n = noise(d)
    out = np.zeros_like(n)
    hop = 1024
    for i in range(0, len(n) - hop, hop // 2):  # moving band-pass sweep
        c = 400 + 5000 * np.sin(np.pi * p[i]) ** 2
        seg = filt(n[i : i + hop], lo=c * 0.6, hi=c * 1.6) * np.hanning(hop)
        out[i : i + hop] += seg
    out *= np.sin(np.pi * p) ** 2
    return np.vstack([out * (1 - p * 0.6), out * (0.4 + p * 0.6)]) * 0.5


def sfx_shatter():
    d = 1.2
    t = t_axis(d)
    x = filt(noise(d), lo=2500) * np.exp(-t / 0.08) * 0.8
    for _ in range(40):  # glassy pings
        at = rng.uniform(0, 0.35)
        f = rng.uniform(2500, 7500)
        tt = np.maximum(t - at, 0)
        x += np.sin(2 * np.pi * f * tt) * np.exp(-tt / rng.uniform(0.03, 0.12)) * (t >= at) * 0.12
    x += sub_boom(d, 50) * 0.5
    return np.vstack([x, np.roll(x, 300)]) * 0.6


def sfx_click():
    t = t_axis(0.05)
    x = np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.004) + filt(noise(0.05), lo=4000) * np.exp(-t / 0.002) * 0.6
    return mono(x * 0.4)


def sfx_cash():
    d = 1.0
    t = t_axis(d)
    x = np.zeros_like(t)
    for at in (0.0, 0.09):
        tt = np.maximum(t - at, 0)
        for f, a in [(2093, 1), (2637, 0.7), (3136, 0.6), (4186, 0.3)]:
            x += a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.25) * (t >= at)
    return mono(x / 3 * 0.6)


def sfx_pop():
    t = t_axis(0.25)
    f = 280 + 900 * (1 - np.exp(-t / 0.03))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.07)
    return mono(x * 0.6)


# ---------------------------------------------------------------- io
def write(name, stereo):
    os.makedirs(ROOT, exist_ok=True)
    wav = os.path.join(ROOT, name + ".wav")
    data = (np.clip(stereo.T, -1, 1) * 32767).astype("<i2")
    with wave.open(wav, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    mp3 = os.path.join(ROOT, name + ".mp3")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libmp3lame", "-b:a", "192k", mp3], check=True)
    os.remove(wav)
    print("wrote", os.path.relpath(mp3))


if __name__ == "__main__":
    write("music", music())
    write("message", sfx_message())
    write("whoosh", sfx_whoosh())
    write("shatter", sfx_shatter())
    write("click", sfx_click())
    write("cash", sfx_cash())
    write("pop", sfx_pop())
