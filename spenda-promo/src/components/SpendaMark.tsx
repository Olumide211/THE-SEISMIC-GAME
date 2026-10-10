import React from "react";

// Rounded rect with per-corner radii: [tl, tr, br, bl].
const rr = (x: number, y: number, w: number, h: number, [tl, tr, br, bl]: number[]) =>
  `M${x + tl} ${y}H${x + w - tr}Q${x + w} ${y} ${x + w} ${y + tr}V${y + h - br}Q${x + w} ${y + h} ${x + w - br} ${y + h}H${x + bl}Q${x} ${y + h} ${x} ${y + h - bl}V${y + tl}Q${x} ${y} ${x + tl} ${y}Z`;

// Geometry traced from the Spenda logo: two offset "leaf" tiles forming an S.
export const MARK_TOP = rr(30, 0, 60, 56, [30, 9, 5, 3]);
export const MARK_BOTTOM = rr(0, 64, 60, 56, [5, 3, 30, 9]);
export const MARK_VIEWBOX = "0 0 90 120";

export const SpendaMark: React.FC<{
  size: number; // height in px
  color?: string;
  style?: React.CSSProperties;
}> = ({ size, color = "#fff", style }) => (
  <svg width={(size * 90) / 120} height={size} viewBox={MARK_VIEWBOX} style={{ display: "block", ...style }}>
    <path d={MARK_TOP} fill={color} />
    <path d={MARK_BOTTOM} fill={color} />
  </svg>
);
