import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import React, {useEffect, useRef} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {loadPlate, loadUITextures} from './engine/assets';
import {Director, plateFor} from './engine/director';
import {FPS, makeStudioEnv} from './engine/kit';
import {Ctx} from './engine/shot';
import {buildTimeline} from './timeline';
import {Sting} from './Sting';

export const W = 1920;
export const H = 1080;

let directorPromise: Promise<Director> | null = null;

function getDirector(gl: THREE.WebGLRenderer) {
  if (!directorPromise) {
    directorPromise = (async () => {
      await document.fonts.load('500 80px Inter');
      await document.fonts.load('600 80px Inter');
      const tex = await loadUITextures(gl);
      const ctx: Ctx = {renderer: gl, tex, env: makeStudioEnv(gl, 'top'), envSide: makeStudioEnv(gl, 'side')};
      return new Director(ctx, buildTimeline(ctx), W, H);
    })();
  }
  return directorPromise;
}

/** Owns the frame: renders the whole post pipeline itself (R3F's own render is suppressed). */
const Stage: React.FC<{t: number; only?: string}> = ({t}) => {
  const gl = useThree((s) => s.gl);
  const busy = useRef(Promise.resolve());
  // priority > 0 tells R3F not to render its default scene over ours
  useFrame(() => {}, 1);
  useEffect(() => {
    const handle = delayRender(`frame ${t.toFixed(3)}`, {timeoutInMilliseconds: 600000});
    busy.current = busy.current.then(async () => {
      try {
        const d = await getDirector(gl);
        const p = plateFor(t);
        const plate = p ? await loadPlate(p.kind, p.frame) : null;
        d.render(t, plate);
        gl.getContext().finish();
      } finally {
        continueRender(handle);
      }
    });
  }, [t, gl]);
  return null;
};

export const SpendaLaunch: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{background: '#030303'}}>
      <ThreeCanvas
        width={W}
        height={H}
        dpr={1}
        gl={{antialias: false, preserveDrawingBuffer: true, alpha: false, powerPreference: 'high-performance'}}
        onCreated={({gl}) => {
          gl.autoClear = false;
          gl.toneMapping = THREE.NoToneMapping;
          gl.outputColorSpace = THREE.LinearSRGBColorSpace;
        }}
      >
        <Stage t={t} />
      </ThreeCanvas>
      <Sting t={t} />
      <Audio src={staticFile('audio.mp3')} />
    </AbsoluteFill>
  );
};
