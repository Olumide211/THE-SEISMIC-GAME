import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { prog, seeded } from "../anim";
import { Coin } from "./Coin";

type Kind = "coinN" | "coinD" | "square" | "dot" | "squiggle" | "sparkle";
const KINDS: Kind[] = ["coinN", "coinD", "square", "dot", "squiggle", "sparkle"];
const COLORS = [brand.colors.ink, brand.colors.success, brand.colors.navy, "#9ED6EF", "#F5C9A4", brand.colors.moneyIn];

const Sparkle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={color} />
  </svg>
);
const Squiggle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 1.6} height={size} viewBox="0 0 40 24">
    <path d="M2 12 C7 2 11 2 14 12 S21 22 26 12 S33 2 38 12" fill="none" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
  </svg>
);

/** One-shot burst. `start` is sequence-local; origin is in px. */
export const Confetti: React.FC<{ start: number; x: number; y: number; count?: number; seed?: number; arc?: [number, number] }> = ({
  start,
  x,
  y,
  count = 30,
  seed = 7,
  arc = [0, Math.PI * 2],
}) => {
  const frame = useCurrentFrame();
  const pieces = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }).map((_, i) => {
      const a = arc[0] + (i / count) * (arc[1] - arc[0]) + (r() - 0.5) * 0.3;
      const speed = 30 + r() * 34;
      return {
        kind: KINDS[i % KINDS.length],
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed * 0.8 - 6,
        spin: (r() - 0.5) * 24,
        size: 14 + r() * 18,
        color: COLORS[Math.floor(r() * COLORS.length)],
        life: 26 + r() * 14,
      };
    });
  }, [count, seed, arc]);

  const t = frame - start;
  if (t < 0) return null;

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {pieces.map((p, i) => {
        // velocity with drag k: displacement = v * (1 - k^t) / (1 - k)
        const k = 0.9;
        const d = (1 - Math.pow(k, t)) / (1 - k);
        const px = x + p.vx * d;
        const py = y + p.vy * d + 0.35 * t * t * 0.5;
        const life = prog(t, p.life * 0.55, p.life);
        const scale = Math.min(1, t / 3);
        let el: React.ReactNode;
        switch (p.kind) {
          case "coinN":
            el = <Coin kind="NGN" size={p.size + 8} />;
            break;
          case "coinD":
            el = <Coin kind="USD" size={p.size + 8} />;
            break;
          case "square":
            el = <div style={{ width: p.size * 0.7, height: p.size * 0.7, borderRadius: 3, background: p.color }} />;
            break;
          case "dot":
            el = <div style={{ width: p.size * 0.6, height: p.size * 0.6, borderRadius: "50%", background: p.color }} />;
            break;
          case "squiggle":
            el = <Squiggle size={p.size} color={p.color} />;
            break;
          default:
            el = <Sparkle size={p.size + 6} color={p.color} />;
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              transform: `translate(-50%, -50%) rotate(${p.kind.startsWith("coin") ? p.spin * 0.3 * t : p.spin * t}deg) scale(${scale})`,
              opacity: 1 - life,
            }}
          >
            {el}
          </div>
        );
      })}
    </div>
  );
};
