// Render every React UI screen (src/ui/registry.tsx) to a 2x PNG texture in public/tex/.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const race = argv[0] === '--race';
const only = race ? argv.slice(1) : argv;
const idsFile = race ? 'src/race/texture-ids.json' : 'src/ui/texture-ids.json';
const outDir = race ? 'public/tex-race' : 'public/tex';
const root = path.resolve(import.meta.dirname, '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
fs.mkdirSync(path.join(root, outDir), {recursive: true});

const ids = JSON.parse(fs.readFileSync(path.join(root, idsFile), 'utf8'));
for (const id of ids) {
  if (only.length && !only.includes(id)) continue;
  const inputProps = {id};
  const composition = await selectComposition({serveUrl, id: 'Tex', inputProps, browserExecutable});
  await renderStill({
    serveUrl,
    composition,
    inputProps,
    browserExecutable,
    imageFormat: 'png',
    output: path.join(root, outDir, `${id}.png`),
  });
  console.log('texture', id, composition.width, 'x', composition.height);
}
