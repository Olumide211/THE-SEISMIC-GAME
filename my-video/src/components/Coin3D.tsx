import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";

const EDGE_LAYERS = 16;

const Face: React.FC<{
  size: number;
  light: string;
  deep: string;
  glyph: string;
  label: string;
  gloss: number;
  back?: boolean;
  thickness: number;
}> = ({ size, light, deep, glyph, label, gloss, back, thickness }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      backfaceVisibility: "hidden",
      transform: `${back ? "rotateY(180deg) " : ""}translateZ(${thickness / 2}px)`,
      background: `radial-gradient(circle at 32% 28%, ${light} 0%, ${deep} 78%)`,
      boxShadow: `inset 0 0 0 ${size * 0.035}px rgba(255,255,255,0.35), inset 0 0 ${size * 0.12}px rgba(0,0,0,0.35)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: size * 0.09,
        borderRadius: "50%",
        border: `${size * 0.018}px solid rgba(255,255,255,0.45)`,
      }}
    />
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size * 0.46,
        lineHeight: 1,
        color: "white",
        textShadow: "0 3px 6px rgba(0,0,0,0.3)",
      }}
    >
      {glyph}
    </span>
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size * 0.085,
        letterSpacing: "0.12em",
        color: "rgba(255,255,255,0.85)",
        marginTop: size * 0.02,
      }}
    >
      {label}
    </span>
    {/* Moving specular streak sells the gloss as the coin spins. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(115deg, transparent ${gloss - 18}%, rgba(255,255,255,0.55) ${gloss}%, transparent ${gloss + 14}%)`,
        mixBlendMode: "screen",
      }}
    />
  </div>
);

// Glossy coin built from CSS 3D layers: a ₦ face, a USDT face and a stacked edge.
export const Coin3D: React.FC<{
  size: number;
  spin: number; // degrees around Y
  tiltX: number;
  tiltZ: number;
}> = ({ size, spin, tiltX, tiltZ }) => {
  const thickness = size * 0.11;
  const gloss = 50 + 60 * Math.sin((spin * Math.PI) / 180);
  return (
    <div style={{ width: size, height: size, perspective: size * 6 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          transform: `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg) rotateY(${spin}deg)`,
        }}
      >
        {new Array(EDGE_LAYERS).fill(0).map((_, i) => {
          const z = -thickness / 2 + (thickness * (i + 0.5)) / EDGE_LAYERS;
          const shade = 0.55 + 0.25 * Math.sin((i / EDGE_LAYERS) * Math.PI);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                transform: `translateZ(${z}px)`,
                background: `rgba(${Math.round(150 * shade)}, ${Math.round(160 * shade)}, ${Math.round(150 * shade)}, 1)`,
              }}
            />
          );
        })}
        <Face
          size={size}
          light="#5FD48E"
          deep={brand.colors.nairaDeep}
          glyph="₦"
          label="NAIRA"
          gloss={gloss}
          thickness={thickness}
        />
        <Face
          size={size}
          light="#5CD1AE"
          deep={brand.colors.usdtDeep}
          glyph="₮"
          label="USDT"
          gloss={100 - gloss}
          thickness={thickness}
          back
        />
      </div>
    </div>
  );
};

// Small flat coin used inside pills.
export const MiniCoin: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 32% 28%, #5CD1AE 0%, ${brand.colors.usdtDeep} 80%)`,
      boxShadow: "0 8px 18px rgba(0,0,0,0.22), inset 0 0 0 3px rgba(255,255,255,0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.5,
    }}
  >
    ₮
  </div>
);
