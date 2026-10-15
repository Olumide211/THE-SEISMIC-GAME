import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";

// The Spenda "S": two folded-ribbon pieces, traced from the logo file on a 240 grid.
// The lower piece is the upper piece rotated 180° around the logo center.
export const RIBBON_PATH =
  "M106 116 L106 85 C106 69 124 58 142 58 L156 58 Q164 58 164 66 L164 113 Q164 116 161 116 Z";
const CENTER = { x: 120, y: 119 };
const VIEW = "70 52 100 134";

export const SpendaLogo: React.FC<{
  size: number;
  color?: string;
  // 0..1: stroke draw-on, fill, and how far each ribbon has unfolded.
  draw?: number;
  fill?: number;
  unfold?: number;
  style?: React.CSSProperties;
}> = ({ size, color = brand.colors.white, draw = 1, fill = 1, unfold = 1, style }) => {
  const u = Math.max(0, Math.min(1, unfold));
  // Each ribbon folds out from the seam between the pieces.
  const fold = (1 - u) * 90;
  const piece = (rot: number, originY: string) => (
    <g
      style={{
        transformBox: "fill-box",
        transformOrigin: `50% ${originY}`,
        transform: `perspective(400px) rotateX(${rot > 0 ? fold : -fold}deg)`,
      }}
    >
      <path
        d={RIBBON_PATH}
        transform={rot ? `rotate(180 ${CENTER.x} ${CENTER.y})` : undefined}
        fill={color}
        fillOpacity={fill}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        strokeOpacity={draw > 0 ? 1 : 0}
      />
    </g>
  );
  return (
    <svg width={size} height={(size * 134) / 100} viewBox={VIEW} style={{ overflow: "visible", ...style }}>
      {piece(1, "100%")}
      {piece(0, "0%")}
    </svg>
  );
};

// App icon: black "S" on a white rounded square (or inverted with `dark`).
export const AppIcon: React.FC<{ size: number; dark?: boolean; style?: React.CSSProperties }> = ({
  size,
  dark,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: dark ? brand.colors.black : brand.colors.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...style,
    }}
  >
    <SpendaLogo size={size * 0.46} color={dark ? brand.colors.white : brand.colors.black} />
  </div>
);

export const Wordmark: React.FC<{ size: number; color?: string }> = ({ size, color = brand.colors.white }) => (
  <span
    style={{
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: size,
      color,
      letterSpacing: "-0.04em",
      lineHeight: 1,
    }}
  >
    {brand.name}
  </span>
);

// Logo + wordmark lockup.
export const Lockup: React.FC<{ size: number; color?: string }> = ({ size, color = brand.colors.white }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
    <SpendaLogo size={size * 0.78} color={color} />
    <Wordmark size={size} color={color} />
  </div>
);
