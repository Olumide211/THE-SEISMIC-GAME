import React from "react";
import { brand } from "../brand";

/** Glossy, 3D-looking brand-gradient orb with a white check that draws on. */
export const GlossyCheck: React.FC<{ size: number; draw: number; radius?: string; checkOpacity?: number; style?: React.CSSProperties }> = ({
  size,
  draw,
  radius = "50%",
  checkOpacity = 1,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: radius,
      position: "relative",
      background: `radial-gradient(circle at 30% 25%, ${brand.colors.primaryLight} 0%, ${brand.colors.primary} 45%, #2A139E 100%)`,
      boxShadow: [
        `0 ${size * 0.16}px ${size * 0.3}px -${size * 0.08}px rgba(91,61,245,0.55)`,
        `inset 0 -${size * 0.06}px ${size * 0.12}px rgba(10,0,60,0.45)`,
        `inset 0 ${size * 0.04}px ${size * 0.06}px rgba(255,255,255,0.35)`,
      ].join(", "),
      ...style,
    }}
  >
    {/* specular highlight */}
    <div
      style={{
        position: "absolute",
        left: "16%",
        top: "8%",
        width: "56%",
        height: "34%",
        borderRadius: "50%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0))",
        filter: `blur(${size * 0.012}px)`,
      }}
    />
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, opacity: checkOpacity }}>
      <path
        d="M29 52 L44 66 L72 36"
        fill="none"
        stroke="#fff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="70"
        strokeDashoffset={70 * (1 - draw)}
        style={{ filter: "drop-shadow(0 2px 3px rgba(20,0,80,0.35))" }}
      />
    </svg>
  </div>
);
