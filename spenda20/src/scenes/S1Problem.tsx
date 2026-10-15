import React from "react";
import { AbsoluteFill, random } from "remotion";
import { brand } from "../brand";
import { FPS, T } from "../timeline";
import { FONT } from "../components/fonts";
import { Glow, Grain } from "../components/Glow";
import { ClockIcon } from "../components/Icons";
import { mix, pop, ramp, useSceneTime } from "../components/motion";

const S = T.s1;
const C = brand.colors;
const COL = { left: 560, width: 800 };

const Bubble: React.FC<{ me: boolean; p: number; top: number; children: React.ReactNode }> = ({ me, p, top, children }) => (
  <div
    style={{
      position: "absolute",
      top,
      ...(me ? { right: 1920 - (COL.left + COL.width) } : { left: COL.left }),
      padding: "22px 34px",
      borderRadius: 34,
      [me ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 10,
      background: me ? C.white : "#262626",
      color: me ? C.black : C.white,
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: 44,
      letterSpacing: "-0.01em",
      opacity: Math.min(1, p * 3),
      scale: String(mix(0.5, 1, p)),
      transformOrigin: me ? "100% 100%" : "0% 100%",
      boxShadow: me ? "0 12px 40px rgba(255,255,255,0.08)" : "none",
    }}
  >
    {children}
  </div>
);

export const S1Problem: React.FC = () => {
  const t = useSceneTime(S.start);

  const header = ramp(t, [S.header, S.header + 0.3]);
  const b = S.bubbles.map((at) => pop(t, at, { damping: 13, stiffness: 260 }));
  const typing = t >= S.typing[0] && t < S.typing[1] ? pop(t, S.typing[0], { damping: 13, stiffness: 260 }) : 0;
  const seen = ramp(t, [S.seen, S.seen + 0.18]);

  // Clock spins faster and faster.
  const ct = Math.max(0, t - S.clockIn);
  const clockAngle = 180 * ct + 900 * ct * ct * ct;
  const clockIn = pop(t, S.clockIn, { damping: 12 });

  // Stack drifts up as the conversation grows.
  const lift = mix(0, -70, ramp(t, [S.bubbles[1], S.seen + 0.2]));

  // Camera shake at the end.
  const shaking = t >= S.shake[0];
  const decay = 1 - ramp(t, [S.shake[0], S.shake[1]], (n) => n);
  const f = Math.floor(t * FPS);
  const sx = shaking ? (random(`sx${f}`) - 0.5) * 26 * decay : 0;
  const sy = shaking ? (random(`sy${f}`) - 0.5) * 18 * decay : 0;

  const dots = (
    <div style={{ display: "flex", gap: 12, height: 52, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: "#9A9A9A",
            translate: `0 ${-8 * Math.max(0, Math.sin(t * 14 - i * 0.9))}px`,
          }}
        />
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Glow t={t} strength={0.5} />
      <AbsoluteFill style={{ translate: `${sx}px ${sy + lift}px` }}>
        {/* Chat header pill */}
        <div
          style={{
            position: "absolute",
            top: 170,
            left: COL.left,
            width: COL.width,
            height: 112,
            borderRadius: 56,
            background: "#161616",
            border: "2px solid #262626",
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "0 22px",
            opacity: header,
            translate: `0 ${mix(-20, 0, header)}px`,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              background: "#3A3A3A",
              color: "#BDBDBD",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            PV
          </div>
          <div style={{ fontFamily: FONT }}>
            <div style={{ color: C.white, fontSize: 36, fontWeight: 600 }}>{brand.copy.chatTitle}</div>
            <div style={{ color: C.muted, fontSize: 24 }}>{typing > 0 ? "typing…" : "last seen recently"}</div>
          </div>
        </div>

        <Bubble me p={b[0]} top={340}>
          {brand.copy.chat.me1}
        </Bubble>
        <Bubble me={false} p={b[1]} top={470}>
          {brand.copy.chat.vendor1}
        </Bubble>
        <Bubble me p={b[2]} top={600}>
          {brand.copy.chat.me2}
        </Bubble>
        {typing > 0 && (
          <Bubble me={false} p={typing} top={730}>
            {dots}
          </Bubble>
        )}
        <div
          style={{
            position: "absolute",
            top: 712,
            right: 1920 - (COL.left + COL.width) + 8,
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 30,
            color: C.seenRed,
            opacity: seen,
            translate: `0 ${mix(14, 0, seen)}px`,
            filter: `blur(${mix(8, 0, seen)}px)`,
          }}
        >
          {brand.copy.chat.seen}
        </div>
      </AbsoluteFill>

      {/* Clock, spinning faster and faster */}
      <div
        style={{
          position: "absolute",
          left: 1510,
          top: 430,
          scale: String(clockIn),
          opacity: clockIn,
          translate: `${sx}px ${sy}px`,
        }}
      >
        <ClockIcon size={190} angle={clockAngle} />
      </div>
      <Grain t={t} />
    </AbsoluteFill>
  );
};
