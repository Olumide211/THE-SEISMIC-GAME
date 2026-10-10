import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { SpendaMark } from "../components/SpendaMark";
import { EXPO, prog, sp } from "../anim";
import { FPS } from "../timeline";

/**
 * Recreation of the real Spenda app-opening animation (from the screen recording):
 * the two-tile mark sits on black, collapses into the "S", then "p-e-n-d-a"
 * pop up one by one from a lower baseline. `t` = frames since launch.
 */
export const SPLASH_LETTER_START = 5;
export const SPLASH_LETTER_GAP = 1.6;

export const Wordmark: React.FC<{
  t: number;
  size: number;
  color?: string;
  letterStart?: number;
  gap?: number;
}> = ({ t, size, color = "#fff", letterStart = SPLASH_LETTER_START, gap = SPLASH_LETTER_GAP }) => {
  const letters = Array.from(brand.name);
  return (
    <div style={{ display: "flex", alignItems: "baseline", fontFamily: FONT, fontWeight: 700, fontSize: size, color, letterSpacing: "-0.03em", lineHeight: 1 }}>
      {letters.map((l, i) => {
        const at = letterStart + (i === 0 ? -1 : i * gap);
        const s = sp(t, at, { damping: 13, stiffness: 220, mass: 0.6 });
        const o = prog(t, at, at + 4, EXPO);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: o,
              transform: `translateY(${(1 - s) * size * 0.32}px) scale(${0.45 + 0.55 * s})`,
              transformOrigin: "50% 100%",
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

export const SplashScreen: React.FC<{ t: number }> = ({ t }) => {
  const markIn = sp(t, 0, { damping: 16, stiffness: 200 });
  const markOut = prog(t, SPLASH_LETTER_START - 2, SPLASH_LETTER_START + 1);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          opacity: 1 - markOut,
          transform: `scale(${(0.85 + 0.15 * markIn) * (1 - markOut * 0.4)})`,
        }}
      >
        <SpendaMark size={64} />
      </div>
      <Wordmark t={t} size={46} />
    </div>
  );
};

export const SPLASH_FRAMES = Math.round(0.66 * FPS);
