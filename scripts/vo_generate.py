"""Voiceover, step 1: clone the user's voice offline with VoxCPM2 and generate takes.

Each line in vo/script.json is generated separately, N takes each, using the user's own
recording (vo/reference.wav, mono 48 kHz) as both reference_wav_path and prompt_wav_path
with its exact transcript as prompt_text. Takes land in vo/takes/<id>_<n>.wav.

usage: /tmp/claude-0/voxenv/bin/python scripts/vo_generate.py [--takes 3] [--only l1,l2]
"""
import argparse
import json
import os
import time

import soundfile as sf
import torch
from voxcpm import VoxCPM

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--takes', type=int, default=3)
ap.add_argument('--only', default='')
ap.add_argument('--steps', type=int, default=10)
args = ap.parse_args()

torch.set_num_threads(os.cpu_count() or 4)
script = json.load(open(os.path.join(ROOT, 'vo/script.json')))
ref = os.path.join(ROOT, 'vo/reference.wav')
out_dir = os.path.join(ROOT, 'vo/takes')
os.makedirs(out_dir, exist_ok=True)

t0 = time.time()
model = VoxCPM.from_pretrained('openbmb/VoxCPM2', load_denoiser=False)
sr = model.tts_model.sample_rate
print(f'model loaded in {time.time() - t0:.0f}s, sample rate {sr}', flush=True)

only = set(filter(None, args.only.split(',')))
for line in script['lines']:
    if only and line['id'] not in only:
        continue
    for n in range(1, args.takes + 1):
        path = os.path.join(out_dir, f"{line['id']}_{n}.wav")
        if os.path.exists(path):
            continue
        torch.manual_seed(1000 * n + sum(map(ord, line['id'])))
        t1 = time.time()
        wav = model.generate(
            text=line['speak'],
            prompt_wav_path=ref,
            prompt_text=script['prompt_text'],
            reference_wav_path=ref,
            cfg_value=2.0,
            inference_timesteps=args.steps,
        )
        sf.write(path, wav, sr)
        dur = len(wav) / sr
        print(f"{line['id']} take {n}: {dur:.2f}s audio in {time.time() - t1:.0f}s", flush=True)
