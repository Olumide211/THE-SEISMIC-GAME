import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { prog, seeded } from "../anim";

const COUNT = 100;

/** Floating dots + tiny ₦ / $ glyphs drifting slowly. Frame is sequence-local. */
export const Particles: React.FC<{ seed?: number }> = ({ seed = 42 }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const items = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: COUNT }).map(() => {
      const glyph = r() < 0.3;
      return {
        x: r() * width,
        y: r() * height,
        vx: (r() - 0.5) * 0.5,
        vy: -0.15 - r() * 0.45,
        wob: 6 + r() * 14,
        phase: r() * Math.PI * 2,
        glyph: glyph ? (r() < 0.5 ? "₦" : "$") : null,
        size: glyph ? 10 + r() * 4 : 1 + r() * 3,
        opacity: 0.15 + r() * 0.35,
        tint: r() < 0.3 ? brand.colors.moneyIn : "#8C8C96",
      };
    });
  }, [seed, width, height]);

  const fade = prog(frame, 0, 10) * (1 - prog(frame, durationInFrames - 8, durationInFrames));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: fade }}>
      {items.map((p, i) => {
        const x = (((p.x + p.vx * frame + Math.sin(frame / 30 + p.phase) * p.wob) % width) + width) % width;
        const y = (((p.y + p.vy * frame) % height) + height) % height;
        return p.glyph ? (
          <span
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: p.size,
              color: p.tint,
              opacity: p.opacity,
              lineHeight: 1,
            }}
          >
            {p.glyph}
          </span>
        ) : (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.tint,
              opacity: p.opacity,
            }}
          />
        );
      })}
    </div>
  );
};
