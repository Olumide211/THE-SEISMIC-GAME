import React from "react";

// Looping arc that stretches and shrinks while it spins, driven by time `t` (s).
export const SwooshLoader: React.FC<{ size: number; t: number; color?: string }> = ({
  size,
  t,
  color = "white",
}) => {
  const len = 0.12 + 0.55 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2.4));
  const rot = t * 620 + 180 * Math.sin(t * Math.PI * 1.2);
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ rotate: `${rot}deg` }}>
      <circle
        cx={25}
        cy={25}
        r={19}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${len} ${1 - len}`}
      />
    </svg>
  );
};
