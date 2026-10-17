import React from 'react';

// same geometry as assets/spenda-logo.svg (viewBox 0 0 90 124)
export const LEAF_TOP = 'M30 34 A34 34 0 0 1 64 0 L83 0 Q90 0 90 7 L90 53 Q90 60 83 60 L37 60 Q30 60 30 53 Z';
export const LEAF_BOTTOM = 'M60 90 A34 34 0 0 1 26 124 L7 124 Q0 124 0 117 L0 71 Q0 64 7 64 L53 64 Q60 64 60 71 Z';

export const SpendaMark: React.FC<{height: number; color?: string}> = ({height, color = '#fff'}) => (
  <svg height={height} width={(height * 90) / 124} viewBox="0 0 90 124">
    <path d={LEAF_TOP} fill={color} />
    <path d={LEAF_BOTTOM} fill={color} />
  </svg>
);
