import React from "react";
import { useCurrentFrame } from "remotion";

/** 8-dot spinner; dots fade around the circle. */
export const Spinner: React.FC<{ size: number; color: string }> = ({ size, color }) => {
  const frame = useCurrentFrame();
  const head = Math.floor(frame / 1.5) % 8;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {Array.from({ length: 8 }).map((_, i) => {
        const age = (head - i + 8) % 8;
        const a = (i / 8) * Math.PI * 2;
        const r = size / 2 - 3;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 5,
              height: 5,
              borderRadius: 3,
              background: color,
              left: size / 2 + Math.sin(a) * r - 2.5,
              top: size / 2 - Math.cos(a) * r - 2.5,
              opacity: 1 - age * 0.11,
            }}
          />
        );
      })}
    </div>
  );
};
