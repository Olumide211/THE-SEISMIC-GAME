# Spenda 2.0: "The Breakup Letter"

45-second 9:16 promo (1080x1920, 30 fps) built with HyperFrames. A breakup letter
to P2P trading that turns into a love story with Spenda.

## What's in it

| Layer | How it's made |
| --- | --- |
| Voiceover | VoxCPM2 clone of `../../voice/me.wav` (offline), one phrase per beat, best take picked by Whisper |
| Captions | Word-by-word from Whisper word timestamps; script wording, key words with a green underline |
| Music | `build/compose_music.py`: amapiano-style, 112 BPM, drop on 15.0 s (beat 28), impact on 36.96 s (beat 69), ducked + carved under the VO |
| SFX | Kenney CC0 packs from `../../sfx`, 69 cues on the beats |
| 3D / GPU | Three.js: chat-to-particle explosion, particles gathering into an extruded 3D Spenda S, a spinning USDT coin |
| Transitions | `@hyperframes/shader-transitions`: glitch, chromatic split, cross-warp morph, light leak, whip pans, cinematic zoom |
| Phone | CSS 3D device with HTML app screens (placeholder data only: "Breeze", ₦ ••••••, ₦50,000 → 36.85 USDT, fee ₦0) |

## Rebuild

```bash
uv run python build/gen_vo.py 2          # VO takes (slow on CPU; needs voice/me.wav + voice/me.txt)
uv run --with openai-whisper python build/score_takes.py
build/make.sh                            # music, VO placement, captions, SFX plan, index.html, carve
npx hyperframes check
npx hyperframes render -o renders/spenda-breakup-raw.mp4 --quality delivery --no-page-side-compositing
```

Render with `--no-page-side-compositing`: the page-side shader path drops the
WebGL scenes during transitions; the layered path keeps them.

Then master the audio to -14 LUFS (video stream copied):

```bash
ffmpeg -i renders/spenda-breakup-raw.mp4 -c:v copy \
  -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 320k -movflags +faststart renders/spenda-breakup.mp4
```

Edit `scenes.js`, `styles.css`, `gl.js` or `build/build_index.py`, never
`index.html` directly: `build/make.sh` regenerates it.

The cloned-voice audio (`assets/audio/vo.wav`, `build/vo_*`) and `renders/` are
kept out of git.
