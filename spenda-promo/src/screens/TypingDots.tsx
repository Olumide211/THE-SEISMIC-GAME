import React from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "../brand";

/** Incoming "typing…" bubble with three looping dots. */
export const TypingDots: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 5,
        padding: "13px 14px",
        borderRadius: 16,
        borderBottomLeftRadius: 5,
        background: brand.colors.chatGray,
        transform: `scale(${scale})`,
        transformOrigin: "bottom left",
        boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
      }}
    >
      {[0, 1, 2].map((i) => {
        const phase = ((frame - i * 3) % 12) / 12;
        const lift = Math.max(0, Math.sin(phase * Math.PI * 2));
        return (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "#8E8E93",
              opacity: 0.45 + lift * 0.55,
              transform: `translateY(${-lift * 4}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
