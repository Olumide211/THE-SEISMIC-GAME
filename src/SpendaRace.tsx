import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadPlate, loadTextureSet} from './engine/assets';
import {Director, PlateConfig, plateFor} from './engine/director';
import {FPS, makeStudioEnv} from './engine/kit';
import {Ctx} from './engine/shot';
import {RaceShot} from './race/RaceShot';
import {Captions, Counter, GoStreak} from './race/Overlays';
import {Sting} from './Sting';
import ids from './race/texture-ids.json';

export const RW = 1080;
export const RH = 1920;
const PLATES: PlateConfig = {dir: 'cloth_race', last: 106, holdFirst: 86, end: 30.0};

let directorPromise: Promise<Director> | null = null;
function getDirector(gl: THREE.WebGLRenderer) {
  if (!directorPromise) {
    directorPromise = (async () => {
      await document.fonts.load('500 80px Inter');
      await document.fonts.load('600 80px Inter');
      const tex = await loadTextureSet(gl, ids as string[], 'tex-race');
      const ctx: Ctx = {renderer: gl, tex, env: makeStudioEnv(gl, 'top'), envSide: makeStudioEnv(gl, 'side')};
      // one continuous scene from the reveal to the hero (the cloth plate covers 0-2.85s)
      return new Director(ctx, [{shot: new RaceShot(ctx), a: 2.6, b: 30.1}], RW, RH, PLATES);
    })();
  }
  return directorPromise;
}

const Stage: React.FC<{t: number}> = ({t}) => {
  const gl = useThree((s) => s.gl);
  const busy = useRef(Promise.resolve());
  useFrame(() => {}, 1);
  useEffect(() => {
    const handle = delayRender(`frame ${t.toFixed(3)}`, {timeoutInMilliseconds: 600000});
    busy.current = busy.current.then(async () => {
      try {
        const d = await getDirector(gl);
        const p = plateFor(t, PLATES);
        const plate = p ? await loadPlate(p.kind, p.frame, PLATES.dir) : null;
        d.render(t, plate);
        gl.getContext().finish();
      } catch (e) {
        console.error('render failed', e instanceof Error ? e.stack : e);
        throw e;
      } finally {
        continueRender(handle);
      }
    });
  }, [t, gl]);
  return null;
};

/** layer: 'all' (preview), 'base' (3D + overlays, no captions), 'captions' (transparent caption pass) */
export const SpendaRace: React.FC<{layer?: 'all' | 'base' | 'captions'}> = ({layer = 'all'}) => {
  const t = useCurrentFrame() / FPS;
  if (layer === 'captions') {
    return (
      <AbsoluteFill>
        <Captions t={t} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{background: '#030303'}}>
      <ThreeCanvas
        width={RW}
        height={RH}
        dpr={1}
        gl={{antialias: false, preserveDrawingBuffer: true, alpha: false}}
        onCreated={({gl}) => {
          gl.autoClear = false;
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.LinearSRGBColorSpace;
        }}
      >
        <Stage t={t} />
      </ThreeCanvas>
      <GoStreak t={t} />
      <Counter t={t} />
      {layer === 'all' && <Captions t={t} />}
      <Sting t={t} shift={4.75} tagline={null} fadeEnd={30.0} ui={1.35} />
      <Audio src={staticFile('race-mix.wav')} />
    </AbsoluteFill>
  );
};
