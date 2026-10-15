"""Compose the Spenda 'Breakup Letter' score in code.

Afro-electronic / amapiano-inspired, 112 BPM, F minor, 45 s (exactly 21 bars).
  bars 0-4   (0.00-10.71)  tense: sub pulse, clock ticks, sparse shaker, rising drone
  10.71-14.2              silence (the "It's not me. It's you." line)
  14.2-15.0               reverse swell into the drop
  15.00 (beat 28)          full drop: kick, log drum, shaker, snaps, keys, pad
  33.2-36.96              build (snare roll + riser)
  36.96 (beat 69)          final impact, then punchline hits on beats 69/71/73
  41.25-45                 resolve into a soft pad

Writes build/music_raw.wav (48 kHz stereo, undducked) and build/music_grid.json.
Every random choice uses a fixed seed, so the score is reproducible.
"""
import json
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
BPM = 112
BEAT = 60 / BPM
BAR = BEAT * 4
DUR = 45.0
N = int(DUR * SR)
HERE = Path(__file__).resolve().parent
rng = np.random.default_rng(112)

L = np.zeros(N)
R = np.zeros(N)


def t_of(beat):
    return beat * BEAT


def place(sig, start, gain=1.0, pan=0.0):
    i = int(round(start * SR))
    if i >= N or i + len(sig) <= 0:
        return
    s = sig * gain
    if i < 0:
        s, i = s[-i:], 0
    s = s[: N - i]
    gl = np.cos((pan + 1) * np.pi / 4)
    gr = np.sin((pan + 1) * np.pi / 4)
    L[i : i + len(s)] += s * gl * np.sqrt(2)
    R[i : i + len(s)] += s * gr * np.sqrt(2)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, f, order=2):
    return sosfilt(butter(order, f, "low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------------------------------------------------------------- instruments
def kick(level=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 46 + 90 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(n, 0.16)
    click = hp(rng.standard_normal(n), 3000) * env_exp(n, 0.002) * 0.25
    return np.tanh(1.6 * (body + click)) * level


def log_drum(midi, length=0.42, level=1.0):
    """Amapiano log drum: pitched sine with a fast downward pitch blip, saturated."""
    n = int(length * SR)
    t = np.arange(n) / SR
    f0 = note_hz(midi)
    f = f0 * (1 + 0.55 * np.exp(-t / 0.018))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph)
    amp = env_exp(n, 0.13) * (1 - np.exp(-t / 0.002))
    x = np.tanh(2.4 * x * amp)
    return lp(x, 1400) * level


def shaker(level=1.0, length=0.06):
    n = int(length * SR)
    x = hp(rng.standard_normal(n), 6500, 4)
    a = np.minimum(1, np.arange(n) / (0.004 * SR)) * env_exp(n, 0.018)
    return x * a * level


def snap(level=1.0):
    n = int(0.22 * SR)
    x = np.zeros(n)
    for k, d in enumerate([0, 0.007, 0.015]):
        i = int(d * SR)
        m = n - i
        x[i:] += bp(rng.standard_normal(m), 1400, 4200) * env_exp(m, 0.012 if k < 2 else 0.05)
    return np.tanh(2.0 * x) * level


def tick(level=1.0, hz=3100):
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * hz * t) * env_exp(n, 0.004) + hp(rng.standard_normal(n), 5000) * env_exp(n, 0.0015) * 0.4) * level


def keys(midis, length=0.5, level=1.0):
    """Soft Rhodes-ish chord stab."""
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in midis:
        f = note_hz(m)
        x += np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.05))
    a = (1 - np.exp(-t / 0.004)) * env_exp(n, 0.22)
    return lp(x * a / len(midis), 3200) * level


def pad(midis, length, level=1.0, attack=0.6, release=0.8, cutoff=1800):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for m in midis:
        for det in (-0.09, 0.0, 0.08):
            f = note_hz(m) * 2 ** (det / 12)
            phase = rng.uniform(0, 1)
            x += 2 * ((t * f + phase) % 1.0) - 1  # saw
    x /= len(midis) * 3
    a = np.minimum(1, t / attack) * np.minimum(1, (length - t) / release).clip(0, 1)
    return lp(x, cutoff, 2) * a * level


def sub_pulse(length, hz=43.65, level=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * hz * t) * env_exp(n, 0.28) * (1 - np.exp(-t / 0.01)) * level


def noise_riser(length, level=1.0, f_lo=400, f_hi=9000):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 32
    for b in range(blocks):
        s, e = b * n // blocks, (b + 1) * n // blocks
        fc = f_lo * (f_hi / f_lo) ** (b / blocks)
        out[s:e] = bp(x, fc * 0.7, min(fc * 1.4, SR / 2 - 100))[s:e]
    return out * (t / length) ** 2.2 * level


def impact(level=1.0):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    f = 34 + 70 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.9)
    crash = hp(rng.standard_normal(n), 2500) * env_exp(n, 0.7) * 0.35
    return np.tanh(1.4 * (boom + crash)) * level


def reverse_swell(length, level=1.0):
    n = int(length * SR)
    x = hp(rng.standard_normal(n), 1800) * 0.5 + np.sin(2 * np.pi * note_hz(53) * np.arange(n) / SR) * 0.4
    a = (np.arange(n) / n) ** 3
    return x * a * level


# ---------------------------------------------------------------- arrangement
F1, F2 = 29, 41  # F0/F1 midi
chords = [  # two bars each, F minor colours
    [53, 56, 60, 63, 67],  # Fm9  (F Ab C Eb G)
    [49, 53, 56, 60, 63],  # Dbmaj9 (Db F Ab C Eb)
    [46, 49, 53, 56, 60],  # Bbm9
    [48, 51, 55, 58, 62],  # Cm9
]

# 1) Tense intro: bars 0-4 (0 → 10.71 s)
intro_end = t_of(20)
for b in range(20):
    place(sub_pulse(BEAT * 0.95, level=0.55 + 0.02 * b), t_of(b))
    place(tick(0.22), t_of(b), pan=0.35)
    place(tick(0.11, 2500), t_of(b + 0.5), pan=-0.35)
for s in range(8 * 4, 20 * 4):  # shaker creeps in from bar 2
    if s % 2 == 1:
        place(shaker(0.10 + 0.002 * (s - 32)), t_of(s / 4), pan=0.2)
for b in (12, 14, 16, 18):  # snaps from bar 3
    place(snap(0.22), t_of(b + 1), pan=-0.1)
drone = pad([41, 42, 48], intro_end - 0.2, level=0.18, attack=3.0, release=0.4, cutoff=900)  # F/Gb/C tension
place(drone, 0.1)
place(noise_riser(1.6, 0.18), intro_end - 1.6)

# 2) Silence 10.71 → 14.2, reverse swell into the drop
place(reverse_swell(0.8, 0.35), 15.0 - 0.8)

# 3) Drop: beat 28 (15.0 s) → beat 69 (36.96 s)
drop_start, drop_end = 28, 69
ld_pattern = [(0, 0), (3, 0), (6, 3), (10, 7), (11, 5), (14, 3)]  # (16th step, semitone offset)
for beat in range(drop_start, drop_end):
    place(kick(0.85), t_of(beat))
    if beat % 2 == 1:
        place(snap(0.42), t_of(beat), pan=0.12)
    for s in range(4):  # swung 16th shakers
        swing = 0.035 * BEAT if s % 2 == 1 else 0
        place(shaker(0.16 if s % 2 else 0.09), t_of(beat + s / 4) + swing, pan=-0.25)
for bar in range(7, 18):  # bars 7..17 hold the drop
    root = [F2, F2 - 4, F2 - 7, F2 - 5][((bar - 7) // 2) % 4]
    for step, semi in ld_pattern:
        t0 = bar * BAR + step * BEAT / 4
        if t0 >= t_of(drop_end):
            break
        place(log_drum(root + 12 + semi, level=0.62), t0, pan=0.0)
    ch = chords[((bar - 7) // 2) % 4]
    for off in (0.5, 1.5, 2.75):  # offbeat key stabs
        if bar * BAR + off * BEAT < t_of(drop_end):
            place(keys(ch, 0.45, 0.20), bar * BAR + off * BEAT, pan=0.3 if off != 1.5 else -0.3)
    if (bar - 7) % 2 == 0:
        place(pad(ch, BAR * 2, level=0.10, attack=0.3, release=0.5, cutoff=2200), bar * BAR)
# build into the impact
for i in range(16):
    place(snap(0.15 + 0.03 * i), t_of(65) + i * BEAT / 4, pan=(-1) ** i * 0.2)
place(noise_riser(3.6, 0.35), t_of(69) - 3.6)

# 4) Final impact + punchline hits (beats 69, 71, 73)
place(impact(0.95), t_of(69))
for b in (71, 73):
    place(kick(1.0), t_of(b))
    place(log_drum(F2 + 12, 0.6, 0.7), t_of(b))
    place(impact(0.45), t_of(b))
place(log_drum(F2 + 7, 0.5, 0.5), t_of(75))

# 5) Outro pad 41.25 → 45
place(pad([53, 56, 60, 63, 67, 72], DUR - t_of(76.5), level=0.55, attack=1.2, release=2.2, cutoff=1500), t_of(76.5))
place(pad([41, 48], DUR - t_of(76.5), level=0.3, attack=1.0, release=2.4, cutoff=600), t_of(76.5))
for b in range(77, 84):
    place(shaker(0.05), t_of(b + 0.5), pan=0.3)

# ---------------------------------------------------------------- reverb + master
ir_n = int(1.4 * SR)
ir = rng.standard_normal((2, ir_n)) * np.exp(-np.arange(ir_n) / (0.35 * SR))
ir = np.array([hp(ch, 300) for ch in ir])
wetL = fftconvolve(L, ir[0])[:N]
wetR = fftconvolve(R, ir[1])[:N]
mixL = L + 0.06 * wetL
mixR = R + 0.06 * wetR
# hard silence window for the breakup line (keep only the reverb tail decaying)
fade = np.ones(N)
s0, s1 = int(10.75 * SR), int(11.05 * SR)
fade[s0:s1] = np.linspace(1, 0, s1 - s0)
fade[s1 : int(14.2 * SR)] = 0
mixL *= fade
mixR *= fade
# swell back in (reverse swell was placed after fade window)
peak = max(np.abs(mixL).max(), np.abs(mixR).max())
mixL, mixR = np.tanh(1.2 * mixL / peak) / np.tanh(1.2), np.tanh(1.2 * mixR / peak) / np.tanh(1.2)
out = np.stack([mixL, mixR], axis=1) * 0.89
end_fade = int(0.4 * SR)
out[-end_fade:] *= np.linspace(1, 0, end_fade)[:, None]

import soundfile as sf

sf.write(HERE / "music_raw.wav", out.astype(np.float32), SR, subtype="FLOAT")
grid = {"bpm": BPM, "beat": BEAT, "drop": t_of(28), "impact": t_of(69), "hits": [t_of(69), t_of(71), t_of(73)], "outro": t_of(76.5)}
(HERE / "music_grid.json").write_text(json.dumps(grid, indent=2))
print("wrote music_raw.wav", grid)
