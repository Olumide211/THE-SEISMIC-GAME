import React from "react";

/** Tap feedback: a filled pulse plus an expanding ring. p runs 0→1. */
export const Ripple: React.FC<{ p: number; x: number; y: number; size: number; color: string }> = ({
  p,
  x,
  y,
  size,
  color,
}) => {
  if (p <= 0 || p >= 1) return null;
  const ring = 0.6 + p * 1.6;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 30, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          left: -size / 2,
          top: -size / 2,
          borderRadius: "50%",
          background: color,
          opacity: 0.22 * (1 - p),
          transform: `scale(${0.5 + p * 0.9})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          left: -size / 2,
          top: -size / 2,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          opacity: 1 - p,
          transform: `scale(${ring})`,
        }}
      />
    </div>
  );
};
