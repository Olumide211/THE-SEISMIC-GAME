import * as THREE from 'three';
import {staticFile} from 'remotion';
import ids from '../ui/texture-ids.json';

export type TexMap = Record<string, THREE.Texture>;

let cache: Promise<TexMap> | null = null;

function load(url: string, renderer?: THREE.WebGLRenderer) {
  return new Promise<THREE.Texture>((res, rej) => {
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        res(t);
      },
      undefined,
      rej,
    );
  });
}

/** all React-rendered UI textures (public/tex/*.png), loaded once per tab */
export function loadUITextures(renderer: THREE.WebGLRenderer): Promise<TexMap> {
  if (!cache) {
    cache = Promise.all((ids as string[]).map((id) => load(staticFile(`tex/${id}.png`), renderer).then((t) => [id, t] as const))).then((pairs) =>
      Object.fromEntries(pairs),
    );
  }
  return cache;
}

/* cloth plates rendered by Blender (cloth/cloth.py), one per frame */
const plateCache = new Map<string, Promise<THREE.Texture>>();
export function loadPlate(kind: 'main' | 'hold', frame: number) {
  const key = `${kind}_${frame}`;
  if (!plateCache.has(key)) {
    const url = staticFile(`cloth/${kind}_${String(frame).padStart(4, '0')}.png`);
    plateCache.set(
      key,
      load(url).then((t) => {
        // Blender writes straight alpha; the final pass expects display-referred premultiplied
        t.colorSpace = THREE.NoColorSpace;
        t.premultiplyAlpha = true;
        t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter;
        t.needsUpdate = true;
        return t;
      }),
    );
  }
  return plateCache.get(key)!;
}
