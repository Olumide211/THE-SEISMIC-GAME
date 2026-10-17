"""Build the 30 s soundtrack for Spenda Race from assets/audio.mp3 (88 BPM) plus synthesized SFX.

Arrangement (new time <- source time):
  0.0-9.0   intro riser, source 0-5.25 stretched (pitch kept) so the drop lands at 9.0
  9.0-27.0  beat from 5.25, with one extra bar (source 13.58-16.31, bar-aligned) repeated
  27.0-30   everything drops into the source's ambient tail (21.0-), fading to silence
  21-24     beat filtered down (lowpass), back to full at 24 for the stack/hero
SFX: cloth whoosh 2.5, taps 3.8, P2P ticks + muffled thump + error blips 4.5-9,
whooshes on camera moves, chime on "received" 10.4, credit-alert ding + sub hit 15.5,
tap clicks + sparkles 17.5-21, faint ticks 21-24, shimmer on the logo lock ~27.9.
Writes assets/race-audio.wav and assets/credit-alert.mp3.
"""
import os
import subprocess

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
DUR = 30.0
BEAT = 60 / 88
BAR = 4 * BEAT
rng = np.random.default_rng(7)


def decode(path, filt=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    if filt:
        cmd += ['-af', filt]
    cmd += ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def S(t):
    return int(round(t * SR))


def splice(dst, src, at, fade=0.012):
    """add src into dst at time `at` with short fades at both ends"""
    n = len(src)
    f = S(fade)
    src = src.copy()
    if n > 2 * f:
        ramp = np.linspace(0, 1, f)[:, None]
        src[:f] *= ramp
        src[-f:] *= ramp[::-1]
    i = S(at)
    j = min(len(dst), i + n)
    dst[i:j] += src[: j - i]


src = decode(os.path.join(ROOT, 'assets/audio.mp3'))
DROP = 5.25
music = np.zeros((S(DUR) + SR, 2), np.float32)

# intro: stretch 0-5.25 to 9.0 s, pitch preserved
tempo = DROP / 9.0
intro = decode(os.path.join(ROOT, 'assets/audio.mp3'), f'atrim=0:{DROP},asetpts=PTS-STARTPTS,atempo={tempo:.5f}')
splice(music, intro[: S(9.0) + S(0.012)], 0.0)

# beat with one bar repeated at a bar boundary
BAR_A = 5.40 + 3 * BAR  # 13.58
BAR_B = BAR_A + BAR  # 16.31
part1 = src[S(DROP): S(BAR_B)]
splice(music, part1, 9.0)
t_rep = 9.0 + (BAR_B - DROP)
splice(music, src[S(BAR_A): S(BAR_B)], t_rep)
t_rest = t_rep + BAR
beat_end_src = 21.0
rest = src[S(BAR_B): S(beat_end_src)]
beat = np.zeros_like(music)
splice(beat, rest, t_rest)
# drop-out at 27.0: beat cut with a fast fade, ambient tail takes over
cut = S(27.0)
fl = S(0.08)
beat[cut: cut + fl] *= np.linspace(1, 0, fl)[:, None]
beat[cut + fl:] = 0
music += beat
tail = src[S(21.0):]
splice(music, tail * 1.15, 27.0, fade=0.06)

# beat filters down 21-24 (one-pole lowpass, crossfaded)
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x)
    acc = np.zeros(2, np.float32)
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


i0, i1 = S(20.8), S(24.3)
lp = lowpass(music[i0:i1], 450) * 0.8
env = np.ones(i1 - i0)
k = np.arange(i1 - i0) / SR + 20.8
env = np.clip((k - 20.9) / 0.4, 0, 1) * np.clip((24.15 - k) / 0.15, 0, 1)
music[i0:i1] = music[i0:i1] * (1 - env[:, None]) + lp * env[:, None]

# ------------------------------------------------------------------ SFX synthesis
sfx = np.zeros_like(music)


def tone(freqs, dur, decay, amp=0.3, attack=0.002):
    t = np.arange(S(dur)) / SR
    y = sum(a * np.sin(2 * np.pi * f * t) for f, a in freqs)
    e = np.minimum(1, t / attack) * np.exp(-t / decay)
    return np.stack([y * e * amp] * 2, 1).astype(np.float32)


def noise_sweep(dur, f0, f1, amp=0.3, shape=2.0):
    """band-limited noise whoosh sweeping f0 -> f1 (FFT-shaped, per-chunk)"""
    n = S(dur)
    out = np.zeros(n, np.float32)
    chunk = 2048
    w = np.hanning(chunk)
    for i in range(0, n - chunk, chunk // 2):
        p = i / n
        fc = f0 * (f1 / f0) ** p
        spec = np.fft.rfft(rng.standard_normal(chunk) * w)
        fr = np.fft.rfftfreq(chunk, 1 / SR)
        spec *= np.exp(-((np.log(fr + 1) - np.log(fc)) ** 2) / 0.5)
        out[i: i + chunk] += np.fft.irfft(spec).astype(np.float32) * w
    t = np.arange(n) / n
    env = np.sin(np.pi * t) ** shape
    out = out / (np.abs(out).max() + 1e-6) * env * amp
    l = out
    r = np.roll(out, 90)
    return np.stack([l, r], 1)


def click(amp=0.35):
    t = np.arange(S(0.04)) / SR
    y = (np.sin(2 * np.pi * 2400 * t) * 0.6 + rng.standard_normal(len(t)) * 0.4) * np.exp(-t / 0.006)
    return np.stack([y * amp] * 2, 1).astype(np.float32)


def tick(amp=0.18, f=3200):
    t = np.arange(S(0.03)) / SR
    y = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.004) + rng.standard_normal(len(t)) * 0.2 * np.exp(-t / 0.002)
    return np.stack([y * amp] * 2, 1).astype(np.float32)


def thump(amp=0.5):
    t = np.arange(S(0.35)) / SR
    f = 52 + 40 * np.exp(-t / 0.03)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    return np.stack([y * amp] * 2, 1).astype(np.float32)


def error_blip(amp=0.22):
    a = tone([(880, 1), (1760, 0.25)], 0.09, 0.05, amp)
    b = tone([(587, 1), (1174, 0.25)], 0.16, 0.08, amp)
    out = np.zeros((len(a) + len(b) + S(0.02), 2), np.float32)
    out[: len(a)] += a
    out[len(a) + S(0.02):] += b
    return out


def chime(amp=0.25):
    out = np.zeros((S(1.4), 2), np.float32)
    for i, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
        tt = tone([(f, 1), (f * 2.01, 0.2)], 1.2, 0.35, amp * (0.9 - i * 0.12))
        splice(out, tt, i * 0.045, fade=0.001)
    return out


def credit_alert():
    """bright two-note alert ding (bell partials) layered with a short sparkle"""
    out = np.zeros((S(1.8), 2), np.float32)
    bell = lambda f, d: tone([(f, 1.0), (f * 2.0, 0.45), (f * 2.76, 0.25), (f * 5.4, 0.1)], d, d / 3.2, 0.32)
    splice(out, bell(1318.5, 1.2), 0.0, fade=0.001)
    splice(out, bell(1975.5, 1.5), 0.13, fade=0.001)
    return out


def sub_hit(amp=0.85):
    t = np.arange(S(1.2)) / SR
    f = 38 + 90 * np.exp(-t / 0.04)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    y += rng.standard_normal(len(t)) * 0.15 * np.exp(-t / 0.01)
    return np.stack([y * amp] * 2, 1).astype(np.float32)


def sparkle(amp=0.14):
    out = np.zeros((S(0.6), 2), np.float32)
    for i in range(7):
        f = rng.uniform(2800, 6500)
        splice(out, tone([(f, 1)], 0.25, 0.06, amp * rng.uniform(0.5, 1)), i * 0.035 + rng.uniform(0, 0.02), fade=0.001)
    return out


def shimmer(amp=0.16):
    n = S(2.6)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for f in [1567.98, 2093.0, 2637.0, 3135.96, 4186.0, 5274.0]:
        y += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (1 + 0.5 * np.sin(2 * np.pi * rng.uniform(5, 9) * t))
    e = np.minimum(1, t / 0.05) * np.exp(-t / 0.9)
    y = y / 6 * e * amp
    return np.stack([y, np.roll(y, 240)], 1).astype(np.float32)


def reverb(x, secs=1.6, wet=0.35):
    ir_n = S(secs)
    t = np.arange(ir_n) / SR
    ir = rng.standard_normal((ir_n, 2)) * np.exp(-t / (secs / 5))[:, None]
    ir /= np.sqrt((ir ** 2).sum(0))
    out = np.zeros((len(x) + ir_n, 2), np.float32)
    n = 1 << int(np.ceil(np.log2(len(x) + ir_n)))
    for c in range(2):
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], n) * np.fft.rfft(ir[:, c], n), n)[: len(out)]
    return x * (1 - wet) + out[: len(x)] * wet * 3


# cloth whoosh, taps, GO streak
splice(sfx, noise_sweep(0.9, 300, 3000, 0.45), 2.3)
splice(sfx, click(0.45), 3.8)
splice(sfx, click(0.4), 3.815)
splice(sfx, noise_sweep(0.45, 1200, 5000, 0.18), 4.0)
# P2P pain: uneasy ticking clock + muffled low beat + error blips on each failure
for k in np.arange(4.5, 9.0, 0.5):
    splice(sfx, tick(0.16 if int(k * 2) % 2 == 0 else 0.11, 3200 if int(k * 2) % 2 == 0 else 2600), k, fade=0.001)
for k in np.arange(4.62, 9.0, BEAT * 2):
    splice(sfx, thump(0.42), k)
for k in [5.4, 6.3, 7.3, 8.1]:
    splice(sfx, error_blip(), k)
# Spenda: whip whoosh into the drop, chime on received, button whoosh + sparkle
splice(sfx, noise_sweep(0.55, 400, 6000, 0.6, 1.2), 8.7)
splice(sfx, noise_sweep(0.5, 600, 4000, 0.22), 10.1)
splice(sfx, chime(0.26), 10.4)
splice(sfx, noise_sweep(0.45, 500, 4000, 0.2), 11.4)
splice(sfx, click(0.4), 13.4)
splice(sfx, sparkle(0.16), 13.5)
splice(sfx, noise_sweep(0.6, 300, 4500, 0.32), 14.75)
# money moment
alert = credit_alert()
splice(sfx, alert * 0.95, 15.5, fade=0.001)
splice(sfx, sub_hit(0.9), 15.5, fade=0.001)
# bonus taps and chips
for k in [18.2, 19.4]:
    splice(sfx, click(0.4), k)
    splice(sfx, sparkle(0.15), k + 0.15)
# cut back: whoosh, faint ticks
splice(sfx, noise_sweep(0.8, 250, 2500, 0.3), 20.7)
for k in np.arange(21.2, 24.0, 0.5):
    splice(sfx, tick(0.06), k, fade=0.001)
splice(sfx, noise_sweep(0.8, 300, 3000, 0.3), 23.8)
# logo lock shimmer
splice(sfx, shimmer(0.18), 27.7, fade=0.01)
sfx = reverb(sfx, 1.4, 0.28)

mix = music * 0.9 + sfx
mix = mix[: S(DUR)]
# end fade to silence by 30 s
fe = S(1.2)
mix[-fe:] *= np.linspace(1, 0, fe)[:, None] ** 2
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.4) / np.tanh(1.4) * 0.95  # gentle limiter
os.makedirs(os.path.join(ROOT, 'assets'), exist_ok=True)


def write(path, x):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', path], stdin=subprocess.PIPE)
    p.communicate(x.astype(np.float32).tobytes())


write(os.path.join(ROOT, 'assets/race-audio.wav'), mix)
ca = alert.copy()
ca = reverb(np.concatenate([ca, np.zeros((S(0.6), 2), np.float32)]), 1.0, 0.2)
write(os.path.join(ROOT, 'assets/credit-alert.mp3'), ca / np.abs(ca).max() * 0.9)
print('beat repeat at', round(t_rep, 3), 'rest from', round(t_rest, 3), 'peak', peak)
