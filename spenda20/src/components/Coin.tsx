import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";

const EDGE_LAYERS = 16;

const Face: React.FC<{ size: number; gloss: number; thickness: number; back?: boolean }> = ({
  size,
  gloss,
  thickness,
  back,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: "50%",
      backfaceVisibility: "hidden",
      transform: `${back ? "rotateY(180deg) " : ""}translateZ(${thickness / 2}px)`,
      background: `radial-gradient(circle at 32% 26%, ${brand.colors.usdtLight} 0%, ${brand.colors.success} 42%, ${brand.colors.successDeep} 88%)`,
      boxShadow: `inset 0 0 0 ${size * 0.035}px rgba(255,255,255,0.4), inset 0 -${size * 0.06}px ${size * 0.12}px rgba(0,0,0,0.3)`,
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
        border: `${size * 0.018}px solid rgba(255,255,255,0.5)`,
      }}
    />
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size * 0.48,
        lineHeight: 1,
        color: "white",
        textShadow: "0 3px 8px rgba(0,0,0,0.25)",
      }}
    >
      ₮
    </span>
    <span
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size * 0.085,
        letterSpacing: "0.14em",
        color: "rgba(255,255,255,0.9)",
        marginTop: size * 0.02,
      }}
    >
      USDT
    </span>
    {/* Specular streak that travels as the coin turns */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(115deg, transparent ${gloss - 18}%, rgba(255,255,255,0.6) ${gloss}%, transparent ${gloss + 14}%)`,
        mixBlendMode: "screen",
      }}
    />
  </div>
);

// Glossy green USDT coin built from CSS 3D layers.
export const Coin: React.FC<{ size: number; spin: number; tiltX?: number; tiltZ?: number }> = ({
  size,
  spin,
  tiltX = 14,
  tiltZ = -12,
}) => {
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
          const shade = 0.5 + 0.3 * Math.sin((i / EDGE_LAYERS) * Math.PI);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                transform: `translateZ(${z}px)`,
                background: `rgb(${Math.round(40 * shade)}, ${Math.round(150 * shade)}, ${Math.round(80 * shade)})`,
              }}
            />
          );
        })}
        <Face size={size} gloss={gloss} thickness={thickness} />
        <Face size={size} gloss={100 - gloss} thickness={thickness} back />
      </div>
    </div>
  );
};

// Tiny flat coin for confetti: "₦" or "$".
export const TinyCoin: React.FC<{ size: number; glyph: string; dark?: boolean }> = ({ size, glyph, dark }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: dark
        ? "radial-gradient(circle at 30% 28%, #444 0%, #000 85%)"
        : `radial-gradient(circle at 30% 28%, ${brand.colors.usdtLight} 0%, ${brand.colors.successDeep} 85%)`,
      boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.35), 0 4px 10px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.56,
    }}
  >
    {glyph}
  </div>
);
