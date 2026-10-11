import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";

export type CoinKind = "NGN" | "USDT" | "USDC" | "USD";

const coinStyle: Record<CoinKind, { bg: string; glyph: string }> = {
  NGN: { bg: brand.colors.moneyIn, glyph: "₦" },
  USDT: { bg: brand.colors.tether, glyph: "₮" },
  USDC: { bg: "#2775CA", glyph: "$" },
  USD: { bg: "#E7B416", glyph: "$" },
};

/** Flat coin with ring + glyph, all in SVG/CSS. */
export const Coin: React.FC<{ kind: CoinKind; size: number; style?: React.CSSProperties }> = ({
  kind,
  size,
  style,
}) => {
  const c = coinStyle[kind];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%), ${c.bg}`,
        boxShadow: `inset 0 0 0 ${size * 0.07}px rgba(255,255,255,0.28), inset 0 -${size * 0.06}px ${size * 0.1}px rgba(0,0,0,0.18)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size * 0.54,
        lineHeight: 1,
        flexShrink: 0,
        ...style,
      }}
    >
      {kind === "USDT" ? <TetherGlyph size={size * 0.56} /> : c.glyph}
    </div>
  );
};

const TetherGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <rect x="3" y="3" width="18" height="4.2" rx="1" />
    <rect x="9.6" y="3" width="4.8" height="18" rx="1" />
    <ellipse cx="12" cy="11.6" rx="8.4" ry="2.6" fill="none" stroke="#fff" strokeWidth="1.8" />
  </svg>
);
