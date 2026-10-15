import React from "react";
import { brand } from "../brand";
import { useDirBlur } from "./DirBlur";

// Arrow cursor drawn in SVG. Position is the tip of the arrow.
export const Cursor: React.FC<{
  x: number;
  y: number;
  scale?: number;
  blurX?: number;
  blurY?: number;
  opacity?: number;
}> = ({ x, y, scale = 1, blurX = 0, blurY = 0, opacity = 1 }) => {
  const { defs, filter } = useDirBlur(blurX, blurY);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 46,
        height: 58,
        scale: String(scale),
        transformOrigin: "0 0",
        opacity,
        filter,
      }}
    >
      {defs}
      <svg width={46} height={58} viewBox="0 0 46 58" style={{ overflow: "visible" }}>
        <path
          d="M2 2 L2 44 L13 34 L21 52 L29 48.5 L21 31 L36 31 Z"
          fill={brand.colors.black}
          stroke={brand.colors.white}
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
        />
      </svg>
    </div>
  );
};

// Expanding ring that marks a click.
export const Ripple: React.FC<{ x: number; y: number; p: number; color?: string }> = ({
  x,
  y,
  p,
  color = "rgba(0,0,0,0.28)",
}) => {
  if (p <= 0 || p >= 1) return null;
  const size = 30 + p * 150;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background: color,
        opacity: 1 - p,
      }}
    />
  );
};
