import React from "react";
import { AbsoluteFill } from "remotion";
import { brand } from "../brand";
import { FONT } from "./fonts";
import { mix, ramp } from "./motion";

// Word-by-word reveal: opacity 0->1, translateY 14->0, blur 8->0, 70ms stagger.
// "\n" in the text forces a line break.
export const RevealWords: React.FC<{
  text: string;
  t: number;
  start: number;
  style?: React.CSSProperties;
  stagger?: number;
}> = ({ text, t, start, style, stagger = 0.07 }) => {
  let index = 0;
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", ...style }}>
      {text.split("\n").map((line, li) => (
        <span key={li} style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em", justifyContent: "inherit" }}>
          {line.split(" ").map((w, wi) => {
            const i = index++;
            const p = ramp(t, [start + i * stagger, start + i * stagger + 0.32]);
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  opacity: p,
                  translate: `0 ${mix(14, 0, p)}px`,
                  filter: `blur(${mix(8, 0, p)}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
};

// One full-frame kinetic card for a hard cut: scales 1.1 -> 1 out of a blur.
export const KineticCard: React.FC<{
  text: string;
  t: number;
  start: number;
  dark: boolean;
  size?: number;
  before?: React.ReactNode;
}> = ({ text, t, start, dark, size = 230, before }) => {
  const p = ramp(t, [start, start + 0.26]);
  return (
    <AbsoluteFill
      style={{
        background: dark ? brand.colors.black : brand.colors.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: size * 0.28,
          scale: String(mix(1.1, 1, p)),
          filter: `blur(${mix(14, 0, p)}px)`,
          opacity: mix(0.4, 1, p),
        }}
      >
        {before}
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: size,
            letterSpacing: "-0.05em",
            color: dark ? brand.colors.white : brand.colors.black,
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
