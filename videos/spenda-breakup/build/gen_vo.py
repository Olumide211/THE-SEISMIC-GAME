"""Generate VO takes for every line with the VoxCPM2 clone of voice/me.wav."""
import json, sys
from pathlib import Path
import numpy as np, soundfile as sf
from voxcpm import VoxCPM

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
OUT = HERE / "vo_takes"; OUT.mkdir(exist_ok=True)
takes = int(sys.argv[1]) if len(sys.argv) > 1 else 2
first = int(sys.argv[2]) if len(sys.argv) > 2 else 0
only = set(sys.argv[3].split(",")) if len(sys.argv) > 3 else None
ref = ROOT / "voice/me.wav"
clone = dict(reference_wav_path=str(ref), prompt_wav_path=str(ref),
             prompt_text=(ROOT / "voice/me.txt").read_text().strip())
model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
sr = model.tts_model.sample_rate
for line in json.loads((HERE / "vo_lines.json").read_text()):
    if only and line["id"] not in only:
        continue
    for t in range(first, first + takes):
        p = OUT / f"{line['id']}_t{t}.wav"
        if p.exists():
            continue
        wav = np.asarray(model.generate(text=line["say"], cfg_value=2.0, inference_timesteps=12, **clone), dtype=np.float32)
        sf.write(p, wav, sr)
        print(f"{p.name} {len(wav)/sr:.2f}s", flush=True)
