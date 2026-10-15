import React from "react";

// Morphing container: a centered rounded box whose size, radius and color are animated.
export const Pill: React.FC<{
  w: number;
  h: number;
  r: number;
  bg: string;
  x?: number;
  y?: number;
  shadow?: string;
  border?: string;
  scale?: number;
  transform?: string;
  overflow?: "hidden" | "visible";
  children?: React.ReactNode;
}> = ({ w, h, r, bg, x = 960, y = 540, shadow, border, scale = 1, transform, overflow = "hidden", children }) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      borderRadius: r,
      background: bg,
      boxShadow: shadow,
      border,
      boxSizing: "border-box",
      scale: String(scale),
      transform,
      overflow,
    }}
  >
    {children}
  </div>
);

// Label that swaps by sliding up with a blur.
export const SwapText: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  p: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ from, to, p, distance = 36, style }) => (
  <div style={{ position: "relative", display: "grid", ...style }}>
    <div
      style={{
        gridArea: "1 / 1",
        opacity: 1 - p,
        translate: `0 ${-distance * p}px`,
        filter: `blur(${8 * p}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {from}
    </div>
    <div
      style={{
        gridArea: "1 / 1",
        opacity: p,
        translate: `0 ${distance * (1 - p)}px`,
        filter: `blur(${8 * (1 - p)}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {to}
    </div>
  </div>
);
