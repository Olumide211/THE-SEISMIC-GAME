import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {TEXTURES} from './ui/registry';

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
