# THE SEISMIC GAME: motion video toolkit

This repo makes videos in code. Each video is an HTML page animated with GSAP
(and Three.js when you need 3D), and HyperFrames renders the page to MP4
frame by frame. The game itself is still `index.html` at the root.

Set up on Linux (Ubuntu 24.04, apt), CPU only, no NVIDIA GPU.

## What's installed

| Item | Version | Status |
| --- | --- | --- |
| Node.js | 22.22 | ✅ preinstalled |
| ffmpeg / ffprobe | 6.1.1 | ✅ preinstalled |
| uv | 0.11 | ✅ preinstalled |
| hyperframes, @hyperframes/shader-transitions | 0.8.160 | ✅ `package.json` |
| gsap | 3.15 | ✅ `package.json` |
| three | 0.186 | ✅ `package.json` |
| HyperFrames agent skills (10) | latest | ✅ `npx hyperframes skills update` installed them into `~/.claude/skills` |
| Headless Chrome (for rendering) | 152 | ✅ `npx hyperframes browser ensure` |
| voxcpm (VoxCPM2) | 2.0.3 | ⚠️ installed in `.venv` (Python 3.12, uv); model weights not downloaded yet |
| kokoro (lighter voice, added because there's no GPU) | latest | ⚠️ installed in `.venv`; model weights not downloaded yet |
| espeak-ng | 1.51 | ✅ apt (Kokoro's fallback for unknown words) |
| openai-whisper | latest | ⚠️ `uv tool install`; `whisper` command works, models not downloaded yet |
| Fonts: Anton, Instrument Serif, JetBrains Mono, Space Grotesk | — | ✅ `.woff2` in `assets/fonts/` with OFL licenses and `fonts.css` |
| Kenney sound effects | — | ❌ not downloaded, see `sfx/README.md` |

### What's still missing

The cloud session's network policy blocked these hosts, so these parts aren't
done yet:

- **huggingface.co**: VoxCPM2 and Kokoro download their voice models from here
  the first time you use them.
- **openaipublic.azureedge.net**: Whisper downloads its models from here.
- **kenney.nl**: the five sound-effect packs.
- **fonts.google.com**: not needed in the end. The same Google Fonts files came
  from the Fontsource packages on npm.

On a normal internet connection the voice and Whisper models download on first
use. In a Claude cloud session, add those hosts under Network access in the
environment settings first.

## Make a video

```bash
npm run new-video -- my-video        # makes videos/my-video/ from the template
cd videos/my-video
# edit index.html: clips use data-start/data-duration, animate with one paused GSAP timeline
npx hyperframes check                # lint + layout + contrast checks
npx hyperframes preview              # live editor (Studio) in the browser
npx hyperframes render               # writes renders/my-video.mp4
```

A video project can only load files from inside its own folder, because
HyperFrames rejects `../` paths. That's why `new-video` copies GSAP, Three.js
and the fonts into each project. Put sound effects and voiceovers in that
project's `assets/` folder too.

`videos/smoke-test/` is a working example. It's a 3-second title card, and
`renders/smoke-test.mp4` is the test render: 1920×1080, 30 fps, 90 frames,
rendered in 7 s.

If you work on videos with Claude Code, it uses the HyperFrames skills (start
with `/hyperframes`). To reinstall them: `npm run skills`.

### Voiceover (once the models can download)

```bash
uv run python -c "
from kokoro import KPipeline; import soundfile as sf, numpy as np
audio = np.concatenate([a for _,_,a in KPipeline(lang_code='a')('The ground is shaking.', voice='af_heart')])
sf.write('voice.wav', audio, 24000)"
```

To narrate in your own voice (VoxCPM2 clone of `voice/me.wav`), put one line
per sentence in a text file and run:

```bash
uv run python scripts/narrate.py script.txt -o videos/my-video/assets/audio
```

It writes `line-NN.wav`, a joined `narration.wav`, and `narration.json` with
each line's start and end time. Put the exact words of the sample in
`voice/me.txt` for a closer match. `voice/` is gitignored so your recording
stays on this machine. VoxCPM2 is slow on CPU, so expect several seconds of
compute per second of speech. See https://github.com/OpenBMB/VoxCPM.

### Caption word timing

```bash
whisper voice.wav --model small.en --word_timestamps True --output_format json
```

The JSON gives a start and end time for every word, which you can use to time
the captions.

## Health check

```bash
npm run doctor
```

On this machine, doctor flags three optional items as missing, and none of
them is needed:

- whisper.cpp: the `whisper` command above does the transcription instead.
- kokoro-onnx: the PyTorch Kokoro in `.venv` is installed instead.
- MusicGen: optional background-music generator.

It also says Docker isn't running. You only need Docker for `render --docker`.
