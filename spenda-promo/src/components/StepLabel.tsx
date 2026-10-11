import React from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { EXPO, prog, revealStyle } from "../anim";

const STAGGER = 2; // 80ms at 25fps
const EXIT_FRAMES = 8;

/**
 * Two-line step label. line1 regular gray, line2 semibold ink, 56px.
 * Words stagger in (rise + fade + unblur); exit slides 40px sideways + fades.
 * `start` and `exit` are frames relative to the enclosing Sequence.
 */
export const StepLabel: React.FC<{
  line1: string;
  line2: string;
  side: "left" | "right";
  start?: number;
  exit?: number;
  inset?: number;
  y?: number;
}> = ({ line1, line2, side, start = 4, exit, inset = 150, y = 0 }) => {
  const frame = useCurrentFrame();
  const words1 = line1.split(" ");
  const words2 = line2.split(" ");
  const out = exit === undefined ? 0 : prog(frame, exit, exit + EXIT_FRAMES);
  const dir = side === "left" ? -1 : 1;

  const renderLine = (words: string[], offset: number, style: React.CSSProperties) => (
    <div
      style={{
        display: "flex",
        gap: "0.26em",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const at = start + (offset + i) * STAGGER;
        const p = prog(frame, at, at + 12, EXPO);
        return (
          <span key={i} style={{ display: "inline-block", ...revealStyle(p) }}>
            {w}
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        [side]: inset,
        transform: `translate(${out * 40 * dir}px, calc(-50% + ${y}px))`,
        opacity: 1 - out,
        fontFamily: FONT,
        fontSize: 56,
        lineHeight: 1.12,
        letterSpacing: "-0.02em",
        textAlign: side,
        zIndex: 20,
      }}
    >
      {renderLine(words1, 0, { color: brand.colors.muted, fontWeight: 400 })}
      {renderLine(words2, words1.length, { color: brand.colors.ink, fontWeight: 600 })}
    </div>
  );
};
