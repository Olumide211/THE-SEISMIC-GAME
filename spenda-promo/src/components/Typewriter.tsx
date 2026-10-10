import React from "react";
import { useCurrentFrame } from "remotion";
import { prog } from "../anim";

/** Letter-by-letter typing; the newest letter arrives blurred and sharpens. */
export const Typewriter: React.FC<{
  text: string;
  start: number;
  framesPerChar: number;
  style?: React.CSSProperties;
  caret?: string | false;
  blurNewest?: boolean;
}> = ({ text, start, framesPerChar, style, caret = false, blurNewest = true }) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);
  const typed = Math.max(0, Math.min(chars.length, Math.floor((frame - start) / framesPerChar) + 1));
  const done = typed >= chars.length;
  const caretOn = caret && (!done || Math.floor(frame / 8) % 2 === 0);
  return (
    <span style={{ whiteSpace: "pre", position: "relative", ...style }}>
      {chars.map((c, i) => {
        const appear = start + i * framesPerChar;
        const p = prog(frame, appear, appear + framesPerChar * 2 + 2);
        const glyph =
          frame < appear ? (
            <span style={{ opacity: 0 }}>{c}</span>
          ) : (
            <span
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: 0.35 + 0.65 * p,
                filter: blurNewest && p < 1 ? `blur(${(1 - p) * 8}px)` : undefined,
                transform: `translateY(${(1 - p) * 6}px)`,
              }}
            >
              {c}
            </span>
          );
        return (
          <React.Fragment key={i}>
            {glyph}
            {caret && i === typed - 1 ? <Caret color={caret} on={!!caretOn} /> : null}
          </React.Fragment>
        );
      })}
    </span>
  );
};

const Caret: React.FC<{ color: string; on: boolean }> = ({ color, on }) => (
  <span style={{ display: "inline-block", width: 0, height: "1em", position: "relative", verticalAlign: "-0.12em" }}>
    <span
      style={{
        position: "absolute",
        left: "0.03em",
        top: 0,
        bottom: 0,
        width: "0.06em",
        borderRadius: 2,
        background: color,
        opacity: on ? 1 : 0,
      }}
    />
  </span>
);
