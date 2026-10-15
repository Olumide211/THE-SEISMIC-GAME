"""Narrate text in a cloned voice with VoxCPM2.

Usage:
    uv run python scripts/narrate.py SCRIPT.txt -o videos/my-video/assets/audio

SCRIPT.txt holds one narration line per non-empty line. Each line becomes
line-NN.wav, and all lines are joined into narration.wav, with a
narration.json recording where each line starts and ends.

The voice comes from voice/me.wav. If voice/me.txt exists it must hold the
exact words spoken in me.wav; VoxCPM then uses it as a prompt, which matches
the voice more closely than the reference audio alone.
"""

import argparse
import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script", type=Path, help="text file, one narration line per line")
    ap.add_argument("-o", "--out", type=Path, required=True, help="output folder")
    ap.add_argument("--ref", type=Path, default=ROOT / "voice/me.wav", help="voice sample to clone")
    ap.add_argument("--transcript", type=Path, default=ROOT / "voice/me.txt", help="exact words in --ref")
    ap.add_argument("--gap", type=float, default=0.35, help="seconds of silence between lines")
    ap.add_argument("--cfg", type=float, default=2.0, help="guidance; higher sticks closer to the text")
    ap.add_argument("--steps", type=int, default=10, help="diffusion steps; more is slower and cleaner")
    args = ap.parse_args()

    lines = [l.strip() for l in args.script.read_text().splitlines() if l.strip()]
    if not lines:
        raise SystemExit(f"{args.script} has no narration lines")
    if not args.ref.exists():
        raise SystemExit(f"voice sample not found: {args.ref}")

    clone = {"reference_wav_path": str(args.ref)}
    transcript = args.transcript.read_text().strip() if args.transcript.exists() else ""
    if transcript:
        clone.update(prompt_wav_path=str(args.ref), prompt_text=transcript)
        print(f"Cloning {args.ref.name} with its transcript")
    else:
        print(f"Cloning {args.ref.name} from audio only (add {args.transcript} for a closer match)")

    from voxcpm import VoxCPM

    model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)
    sr = model.tts_model.sample_rate

    args.out.mkdir(parents=True, exist_ok=True)
    gap = np.zeros(int(args.gap * sr), dtype=np.float32)
    parts, timings, t = [], [], 0.0
    for i, text in enumerate(lines, 1):
        wav = model.generate(text=text, cfg_value=args.cfg, inference_timesteps=args.steps, **clone)
        wav = np.asarray(wav, dtype=np.float32)
        sf.write(args.out / f"line-{i:02d}.wav", wav, sr)
        dur = len(wav) / sr
        timings.append({"line": i, "text": text, "start": round(t, 3), "end": round(t + dur, 3)})
        print(f"  line {i}: {dur:.2f}s  {text}")
        parts += [wav, gap]
        t += dur + args.gap

    sf.write(args.out / "narration.wav", np.concatenate(parts[:-1]), sr)
    (args.out / "narration.json").write_text(json.dumps(timings, indent=2) + "\n")
    print(f"Wrote {args.out / 'narration.wav'} ({t - args.gap:.2f}s)")


if __name__ == "__main__":
    main()
