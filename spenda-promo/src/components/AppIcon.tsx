import React from "react";
import { brand } from "../brand";
import { MARK_BOTTOM, MARK_TOP } from "./SpendaMark";

/**
 * Rounded-square Spenda app icon. `draw` traces the outline (strokeDashoffset),
 * `fill` floods it with the brand gradient and brings in the white mark.
 */
export const AppIcon: React.FC<{
  size: number;
  draw?: number;
  fill?: number;
  id?: string;
  style?: React.CSSProperties;
  radius?: number; // 0..0.5 of size
}> = ({ size, draw = 1, fill = 1, id = "icon", style, radius = 0.27 }) => {
  const r = 100 * radius;
  const per = 4 * (100 - 2 * r) + 2 * Math.PI * r;
  const [a, b, c] = brand.gradientStops;
  return (
    <svg width={size} height={size} viewBox="-4 -4 108 108" style={{ display: "block", overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.5" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" rx={r} fill={`url(#${id}-g)`} opacity={fill} />
      <rect x="0" y="0" width="100" height="50" rx={r} fill={`url(#${id}-gloss)`} opacity={fill * 0.8} />
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx={r}
        fill="none"
        stroke={brand.colors.primary}
        strokeWidth="3"
        strokeDasharray={per}
        strokeDashoffset={per * (1 - draw)}
        opacity={1 - fill * 0.9}
      />
      <g transform={`translate(50 50) scale(${0.56 * (0.6 + 0.4 * fill)}) translate(-45 -60)`} opacity={fill}>
        <path d={MARK_TOP} fill="#fff" />
        <path d={MARK_BOTTOM} fill="#fff" />
      </g>
    </svg>
  );
};
