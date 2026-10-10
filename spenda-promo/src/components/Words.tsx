import React from "react";
import { useCurrentFrame } from "remotion";
import { prog, revealStyle, EXPO } from "../anim";

/**
 * Staggered per-word reveal (opacity + rise 12px + unblur 8px).
 * `start`/`stagger` are in frames relative to the current Sequence.
 */
export const Words: React.FC<{
  words: string[];
  start: number;
  stagger?: number;
  len?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties;
  gap?: string;
}> = ({ words, start, stagger = 2, len = 12, style, wordStyle, gap = "0.28em" }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: gap, ...style }}>
      {words.map((w, i) => {
        const p = prog(frame, start + i * stagger, start + i * stagger + len, EXPO);
        return (
          <span key={i} style={{ display: "inline-block", ...revealStyle(p), ...wordStyle?.(i) }}>
            {w}
          </span>
        );
      })}
    </span>
  );
};
