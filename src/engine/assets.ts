import * as THREE from 'three';
import {staticFile} from 'remotion';
import ids from '../ui/texture-ids.json';

export type TexMap = Record<string, THREE.Texture>;

const caches = new Map<string, Promise<TexMap>>();

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

/** React-rendered UI textures (public/<dir>/<id>.png), loaded once per tab per set */
export function loadTextureSet(renderer: THREE.WebGLRenderer, list: string[], dir: string): Promise<TexMap> {
  if (!caches.has(dir)) {
    caches.set(
      dir,
      Promise.all(list.map((id) => load(staticFile(`${dir}/${id}.png`), renderer).then((t) => [id, t] as const))).then((pairs) => Object.fromEntries(pairs)),
    );
  }
  return caches.get(dir)!;
}

export function loadUITextures(renderer: THREE.WebGLRenderer): Promise<TexMap> {
  return loadTextureSet(renderer, ids as string[], 'tex');
}

/* cloth plates rendered by Blender (cloth/cloth.py), one per frame */
const plateCache = new Map<string, Promise<THREE.Texture>>();
export function loadPlate(kind: 'main' | 'hold', frame: number, dir = 'cloth') {
  const key = `${dir}/${kind}_${frame}`;
  if (!plateCache.has(key)) {
    const url = staticFile(`${dir}/${kind}_${String(frame).padStart(4, '0')}.png`);
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
