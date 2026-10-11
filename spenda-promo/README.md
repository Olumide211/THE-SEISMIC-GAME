# Spenda — "Breaking up with my P2P vendor"

22s, 1920×1080, 25fps promo built entirely in code with Remotion (React + TypeScript). No images, no samples.

```bash
npm i
npm run dev                                   # Remotion Studio
npx remotion render SpendaP2P out/spenda.mp4  # final render
python3 scripts/make-audio.py                 # regenerate music + SFX into public/ (numpy + ffmpeg)
npx remotion bundle --out-dir=build && node scripts/stills.mjs   # QA stills → out/stills
```

**Story:** a WhatsApp breakup with a P2P vendor (sent USDT, still waiting for Naira 40 minutes later) → the real Spenda launch animation full-bleed → pull back to the phone → PIN → home → check the live rate → send USDT → Naira lands → spend it → P2P vs Spenda → "No vendor. No screenshots. No wahala." → end card.

- `src/brand.ts`: colors sampled from the live app, user/demo values, rate, fee, amounts, tagline.
- `src/timeline.ts`: every scene span, event time and SFX cue.
- `src/scenes/`: one file per scene (S1–S12). `src/screens/`: in-phone app screens matching the app (home, rates calculator, deposit, transfer, "Transfer sent"). `src/components/`: phone, camera path, step labels, confetti, particles, icons, logo mark.
- `scripts/make-audio.py`: the amapiano-style soundtrack and every SFX are synthesized here.

Font: Albert Sans (closest free match to the app). To use the app's exact font, drop its files into `public/fonts/` as `app-400.otf`, `app-500.otf`, … — they are picked up automatically.

If Chrome Headless Shell can't be downloaded in your environment, point Remotion at a local one with `REMOTION_BROWSER=/path/to/headless_shell`.
