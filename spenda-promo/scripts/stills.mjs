// Render QA stills from a bundle: node scripts/stills.mjs [bundleDir] [outDir] [seconds...]
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [, , bundle = "build", outDir = "out/stills", ...rest] = process.argv;
const secs = rest.length ? rest.map(Number) : [1, 2.6, 3.8, 4.9, 6, 7.5, 8.6, 9.8, 11.2, 12.9, 14.5, 16, 17, 18.3, 21];
const serveUrl = path.resolve(bundle);
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: "SpendaP2P", browserExecutable });
for (const s of secs) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = path.resolve(outDir, `still-${String(frame).padStart(3, "0")}-${s}s.png`);
  await renderStill({ composition, serveUrl, frame, output, imageFormat: "png", browserExecutable });
  console.log("wrote", output);
}
