# Spenda 2.0 launch film

A 25.2 s, 30 fps, 1920x1080 cinematic 3D product reveal for Spenda 2.0, a Naira-to-stablecoin wallet.
It follows `reference/reference.mp4` shot for shot in camera, motion, lighting, pacing and transitions.
`ref-frames/` holds that reference sampled every 0.25 s (`f_NNN.png`, so t = NNN / 4).

Output: `out/spenda-launch.mp4` (H.264 high profile, CRF 14 (~27 Mbps), AAC 320k, with the supplied soundtrack).

## Pipeline

| Step | What | Command |
| --- | --- | --- |
| 1 | React UI screens -> 2x PNG textures (`src/ui/*`, rendered by Remotion) | `npm run textures` |
| 2 | Cloth reveal 0-2.9 s: headless Blender (bpy 5.0) cloth sim, black satin, Cycles | `npm run cloth` |
| 3 | 3D shots: Remotion + React Three Fiber (`@remotion/three`) -> PNG sequence | `npm run frames` |
| 4 | Mux with audio | `npm run encode` |

`npm run stills -- out/stills/x 3.0 7.5` renders single frames and writes `cmp_<t>.png`,
which puts each still next to the matching reference frame for comparison.

### Cloth (`cloth/cloth.py`)
Two sims run in one script. A satin sheet first settles over the phone slab, and that settled mesh
becomes the rest state of a second sim. In the second sim a pinned patch on the upper-left is hooked
to an empty that yanks it up, left and toward the lens. The Spenda mark is UV-mapped onto the sheet
as a slightly lighter, glossier emboss with bump, so it warps with the folds. Blender renders two passes:
- `main`: the full plate, frames 1-80.
- `hold`: frames 72-88 with the slab as holdout, so the first UI shot shows through while the
  satin sweeps past camera.

bpy setup: `python3.11 -m venv /tmp/claude-0/blendenv && /tmp/claude-0/blendenv/bin/pip install bpy==5.0.1`.

### 3D (`src/engine`, `src/shots`)
- `ThreeCanvas` hosts the renderer. `SpendaLaunch.tsx` suppresses R3F's own render, and the
  `Director` draws each frame itself, so every shot is a pure function of time.
- Motion blur: the shot is re-evaluated at sub-frame times and the results are averaged. The
  sub-frame count comes from the projected camera motion, and a shot can raise it for fast object motion.
- Post (`post.ts`): MSAA scene, depth-based DOF gather, 5-level bloom, ACES, heavy oval
  vignette, film grain and slight chromatic aberration.
- Every UI surface is a React component rendered to a texture on a thick extruded slab, with
  bright bevel rims from a studio environment of softbox strips plus edge glints. No screenshots are used.
- Logo sting and credit (`Sting.tsx`) are HTML/SVG over the defocused hero plate.

### Shot map
| Time (s) | Shot | File |
| --- | --- | --- |
| 0.0-2.9 | Drape and pull (Blender plate) | `cloth/cloth.py` |
| 2.9-6.95 | Macro dolly, arc to the sidebar, "Deposit Naira" beat drop | `shots/Dashboard.ts` |
| 7.0-8.3 | Assets table whip, rows streak in | `shots/Assets.ts` |
| 8.4-12.3 | Green line through the void, P2P ghost, Convert settle | `shots/LineConvert.ts` |
| 12.4-14.8 | Coins snap into the Portfolio donut | `shots/Coins.ts` |
| 14.9-16.3 | Bevel skim to the Account Statement | `shots/Statement.ts` |
| 16.4-17.4 | Security pass, toggles click on | `shots/Security.ts` |
| 17.5-22.5 | Stack, hero rise, hero (balance ticks), dim and defocus | `shots/Hero.ts` |
| 22.5-25.2 | S-mark lock, wordmark, tagline, credit, fade | `Sting.tsx` |

All data is placeholder (user "Breeze").
