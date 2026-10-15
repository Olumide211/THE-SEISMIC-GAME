import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";

// The Spenda app icon: rounded square in the brand color with a white "S".
// To use a real logo file instead, swap the inner <span> for an <Img>.
export const SpendaMark: React.FC<{
  size: number;
  bg?: string;
  fg?: string;
  style?: React.CSSProperties;
}> = ({ size, bg = brand.colors.brand, fg = brand.colors.white, style }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...style,
    }}
  >
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size * 0.62,
        color: fg,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        marginTop: -size * 0.03,
      }}
    >
      S
    </span>
  </div>
);

export const SpendaWordmark: React.FC<{
  size: number;
  color?: string;
  markBg?: string;
}> = ({ size, color = brand.colors.white, markBg = brand.colors.brand }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
    <SpendaMark size={size * 1.05} bg={markBg} />
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        color,
        letterSpacing: "-0.035em",
        lineHeight: 1,
      }}
    >
      {brand.name}
    </span>
  </div>
);
