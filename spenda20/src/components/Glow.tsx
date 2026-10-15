import React from "react";
import { AbsoluteFill } from "remotion";
import { FPS } from "../timeline";

// Slow-breathing soft white radial glow, centered on (x, y).
export const Glow: React.FC<{ t: number; x?: number; y?: number; strength?: number; size?: number }> = ({
  t,
  x = 960,
  y = 540,
  strength = 1,
  size = 1100,
}) => {
  const breath = 0.5 + 0.5 * Math.sin(t * 1.6);
  const s = size * (0.94 + 0.08 * breath);
  return (
    <div
      style={{
        position: "absolute",
        left: x - s / 2,
        top: y - s / 2,
        width: s,
        height: s,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,${(0.16 + 0.06 * breath) * strength}) 0%, rgba(255,255,255,${0.05 * strength}) 38%, rgba(255,255,255,0) 68%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// Subtle animated film grain (2% opacity). A new noise seed every frame.
export const Grain: React.FC<{ t: number; opacity?: number }> = ({ t, opacity = 0.02 }) => {
  const seed = Math.floor(t * FPS) % 97;
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none", mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
