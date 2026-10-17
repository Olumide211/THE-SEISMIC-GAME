"""Mix the voiceover over the soundtrack with ducking -> public/race-mix.wav (48 kHz stereo).

Music drops ~7 dB under the voice (30 ms attack, 280 ms release); SFX ride with the music.
usage: python3 scripts/race_mix.py
"""
import os
import subprocess

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000


def decode(path, ch):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()


music = decode(os.path.join(ROOT, 'assets/race-audio.wav'), 2)
vo = decode(os.path.join(ROOT, 'vo/vo.wav'), 1)[:, 0]
n = max(len(music), len(vo))
music = np.pad(music, ((0, n - len(music)), (0, 0)))
vo = np.pad(vo, (0, n - len(vo)))

# voice envelope -> ducking gain
hop = 240
env = np.sqrt(np.convolve(vo ** 2, np.ones(hop) / hop, 'same'))
active = (env > 0.02).astype(np.float32)
g = np.empty(n, np.float32)
att, rel = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.28 * SR))
duck = 10 ** (-7 / 20)
cur = 1.0
for i in range(0, n, hop):
    tgt = duck if active[i] else 1.0
    k = att if tgt < cur else rel
    for _ in range(1):
        cur = tgt + (cur - tgt) * (k ** hop)
    g[i:i + hop] = cur
mix = music * g[:, None] + np.stack([vo, vo], 1) * 1.05
mix = mix[: int(30.0 * SR)]
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.3) / np.tanh(1.3) * 0.95
out = os.path.join(ROOT, 'public/race-mix.wav')
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', out], stdin=subprocess.PIPE)
p.communicate(mix.astype(np.float32).tobytes())
print('wrote', out, 'peak', round(float(peak), 3))
