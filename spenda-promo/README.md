# Spenda 2.0 — "Breaking up with my P2P vendor"

22s, 1920×1080, 25fps promo built entirely in code with Remotion (React + TypeScript).

```bash
npm i
npm run dev                                   # Remotion Studio
npx remotion render SpendaP2P out/spenda.mp4  # final render
npx remotion bundle --out-dir=build && node scripts/stills.mjs   # QA stills → out/stills
```

- `src/brand.ts` — name, colors (placeholders: swap for real Spenda colors), user name, account number, rate, amounts, tagline, hashtag, handle.
- `src/timeline.ts` — every scene span and event time (in seconds → frames), plus the SFX cue list.
- `src/scenes/` — one file per scene (S1–S13). `src/screens/` — in-phone app screens. `src/components/` — Phone, StepLabel, particles, confetti, icons, coins, logo mark, camera path.
- The "Open Spenda" step and the end-card wordmark recreate the real app's launch animation (two-tile mark → "S" → letters pop in).

Audio is optional: drop `music.mp3` and/or `message.mp3`, `whoosh.mp3`, `shatter.mp3`, `click.mp3`, `cash.mp3`, `pop.mp3` into `public/`. Missing files are skipped.

If Chrome Headless Shell can't be downloaded in your environment, point Remotion at a local one with `REMOTION_BROWSER=/path/to/headless_shell`.
