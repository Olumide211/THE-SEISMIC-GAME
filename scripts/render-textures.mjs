// Render every React UI screen (src/ui/registry.tsx) to a 2x PNG texture in public/tex/.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const only = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
fs.mkdirSync(path.join(root, 'public/tex'), {recursive: true});

const ids = JSON.parse(fs.readFileSync(path.join(root, 'src/ui/texture-ids.json'), 'utf8'));
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
    output: path.join(root, 'public/tex', `${id}.png`),
  });
  console.log('texture', id, composition.width, 'x', composition.height);
}
