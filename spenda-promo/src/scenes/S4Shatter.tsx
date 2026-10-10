import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "../font";
import { Typewriter } from "../components/Typewriter";
import { ChatBubble } from "../screens/ChatBubble";
import { prog, seeded } from "../anim";
import { t, scenes } from "../timeline";

const BW = 230;
const BH = 46;
const SCALE = 2.6;
const COLS = 5;
const ROWS = 4; // 5*4 cells * 2 triangles = 40 shards

type Shard = { pts: [number, number][]; cx: number; cy: number; vx: number; vy: number; spin: number; life: number };

const useShards = () =>
  useMemo(() => {
    const r = seeded(1337);
    // jittered grid vertices (in % of bubble box)
    const v: [number, number][][] = [];
    for (let j = 0; j <= ROWS; j++) {
      v[j] = [];
      for (let i = 0; i <= COLS; i++) {
        const edgeX = i === 0 || i === COLS;
        const edgeY = j === 0 || j === ROWS;
        const x = (i / COLS) * 100 + (edgeX ? 0 : (r() - 0.5) * 12);
        const y = (j / ROWS) * 100 + (edgeY ? 0 : (r() - 0.5) * 16);
        v[j][i] = [x, y];
      }
    }
    const shards: Shard[] = [];
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const a = v[j][i];
        const b = v[j][i + 1];
        const c = v[j + 1][i + 1];
        const d = v[j + 1][i];
        const tris: [number, number][][] = (i + j) % 2 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
        for (const pts of tris) {
          const cx = (pts[0][0] + pts[1][0] + pts[2][0]) / 3;
          const cy = (pts[0][1] + pts[1][1] + pts[2][1]) / 3;
          const dx = (cx - 50) * BW * 0.01;
          const dy = (cy - 50) * BH * 0.01;
          const len = Math.hypot(dx, dy) || 1;
          const speed = 18 + r() * 26;
          shards.push({
            pts,
            cx,
            cy,
            vx: (dx / len) * speed + (r() - 0.5) * 10,
            vy: (dy / len) * speed * 1.8 + (r() - 0.6) * 14,
            spin: (r() - 0.5) * 40,
            life: 14 + r() * 10,
          });
        }
      }
    }
    return shards;
  }, []);

const msg = { from: "them" as const, text: "Send screenshot", time: "20:15" };

const BubbleBox: React.FC = () => (
  <div style={{ width: BW, height: BH }}>
    <ChatBubble msg={msg} style={{ width: BW, height: BH, maxWidth: BW, boxSizing: "border-box", alignItems: "center", justifyContent: "space-between" }} />
  </div>
);

export const S4Shatter: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s4.from;
  const shards = useShards();
  const tt = abs - t.shatter; // frames since shatter
  const tremble = tt < 0 ? Math.sin(frame * 9) * 2.5 : 0;

  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", top: "47%", transform: `translate(-50%, -50%) scale(${SCALE}) translateX(${tremble}px)` }}>
        {tt < 0 ? (
          <BubbleBox />
        ) : (
          <div style={{ position: "relative", width: BW, height: BH }}>
            {shards.map((s, i) => {
              const k = 0.88;
              const d = (1 - Math.pow(k, tt)) / (1 - k);
              const x = (s.vx * d) / SCALE;
              const y = (s.vy * d + 0.9 * tt * tt * 0.5) / SCALE;
              const o = 1 - prog(tt, s.life * 0.4, s.life);
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    inset: 0,
                    clipPath: `polygon(${s.pts.map(([px, py]) => `${px}% ${py}%`).join(",")})`,
                    transformOrigin: `${s.cx}% ${s.cy}%`,
                    transform: `translate(${x}px, ${y}px) rotate(${s.spin * Math.min(tt, 20) * 0.6}deg) scale(${1 - prog(tt, 0, s.life) * 0.4})`,
                    opacity: o,
                  }}
                >
                  <BubbleBox />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, textAlign: "center", transform: "translateY(-30%)" }}>
        <Typewriter
          text="We're done."
          start={t.doneType - scenes.s4.from}
          framesPerChar={1.5}
          style={{ fontFamily: FONT, fontWeight: 600, fontSize: 110, color: "#fff", letterSpacing: "-0.03em" }}
        />
      </div>
    </AbsoluteFill>
  );
};
