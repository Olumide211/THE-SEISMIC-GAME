import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {TEXTURES as LAUNCH_TEXTURES} from './ui/registry';
import {RACE_TEXTURES} from './race/registry';

const TEXTURES = {...LAUNCH_TEXTURES, ...RACE_TEXTURES};

export const TexComp: React.FC<{id: string}> = ({id}) => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(handle));
  }, [handle]);
  const def = TEXTURES[id];
  return (
    <AbsoluteFill style={{background: 'transparent'}}>
      <div style={{transform: 'scale(2)', transformOrigin: '0 0', width: def.w, height: def.h}}>{def.el()}</div>
    </AbsoluteFill>
  );
};
