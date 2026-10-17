// Render stills at given times (seconds) and pair each with the nearest reference frame.
// usage: node scripts/stills.mjs <outdir> 3.0 3.5 ...
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...times] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const chromiumOptions = {gl: 'swangle'};
const puppeteerInstance = await openBrowser('chrome', {browserExecutable, chromiumOptions});
const composition = await selectComposition({serveUrl, id: 'SpendaLaunch', browserExecutable, puppeteerInstance, chromiumOptions});
fs.mkdirSync(path.join(root, outDir), {recursive: true});
for (const s of times) {
  const frame = Math.round(parseFloat(s) * 30);
  const t0 = Date.now();
  const out = path.join(root, outDir, `t${s}.png`);
  await renderStill({serveUrl, composition, frame, output: out, puppeteerInstance, chromiumOptions, imageFormat: 'png', timeoutInMilliseconds: 900000});
  const ref = path.join(root, 'ref-frames', `f_${String(Math.round(parseFloat(s) * 4)).padStart(3, '0')}.png`);
  execFileSync('python3', [path.join(root, 'scripts/pair.py'), out, ref, path.join(root, outDir, `cmp_${s}.png`), s]);
  console.log('still', s, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
await puppeteerInstance.close({silent: true});
