import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { brand } from "../brand";
import { T } from "../timeline";
import { TinyCoin } from "../components/Coin";
import { FONT } from "../components/fonts";
import { SwooshLoader } from "../components/SwooshLoader";
import { SHEET, SuccessSheet } from "../components/SuccessSheet";
import { clamp, easeInOut, mix, mixColor, pop, ramp, useSceneTime } from "../components/motion";
import { BUTTON, S4_CAM_END, S4_CANVAS } from "./S4Flow";

const S = T.s5;
const C = brand.colors;

const PILL = { w: 940, h: 250, r: 46 };
// Final sheet rect, anchored to the bottom of the frame.
export const SHEET_RECT = { x: 960, y: 1080 - SHEET.h / 2 };
const CHECK_CENTER = { x: 960, y: 1080 - SHEET.h + 38 + 12 + 92 + 105 };

const fillAt = (t: number) =>
  interpolate(t, [S.fill[0], S.fill[0] + 0.2, S.fill[0] + 0.4, S.fill[1]], [0, 0.45, 0.62, 1], { ...clamp, easing: easeInOut });

const CONFETTI = new Array(30).fill(0).map((_, i) => {
  const angle = -Math.PI / 2 + (random(`ca${i}`) - 0.5) * Math.PI * 1.25;
  const v = 900 + random(`cv${i}`) * 900;
  return {
    vx: Math.cos(angle) * v,
    vy: Math.sin(angle) * v,
    spin: (random(`cs${i}`) - 0.5) * 900,
    size: 22 + random(`cz${i}`) * 18,
    glyph: i % 2 === 0 ? "₦" : "$",
    delay: random(`cd${i}`) * 0.06,
  };
});

export const Confetti: React.FC<{ t: number; start: number; x: number; y: number }> = ({ t, start, x, y }) => {
  if (t < start) return null;
  return (
    <>
      {CONFETTI.map((c, i) => {
        const dt = Math.max(0, t - start - c.delay);
        const px = x + c.vx * dt;
        const py = y + c.vy * dt + 0.5 * 2600 * dt * dt;
        const fade = 1 - ramp(t, [start + 0.55, start + 0.95]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - c.size / 2,
              top: py - c.size / 2,
              rotate: `${c.spin * dt}deg`,
              opacity: dt > 0 ? fade : 0,
              scale: String(mix(0.3, 1, ramp(t, [start + c.delay, start + c.delay + 0.1]))),
            }}
          >
            <TinyCoin size={c.size} glyph={c.glyph} dark={c.glyph === "₦"} />
          </div>
        );
      })}
    </>
  );
};

export const S5Success: React.FC = () => {
  const t = useSceneTime(S.start);

  const c = pop(t, S.collapse[0], { damping: 16, stiffness: 150 });
  const cLin = ramp(t, [S.collapse[0], S.collapse[1]], easeInOut);
  const tilt = interpolate(t, [S.collapse[0], S.tiltPeak, S.tiltSettle], [0, 1, 0], { ...clamp, easing: easeInOut });
  const cam = mix(S4_CAM_END, 1, cLin);

  const sh = pop(t, S.toSheet[0], { damping: 16, stiffness: 160 });
  const shLin = ramp(t, [S.toSheet[0], S.toSheet[1]], easeInOut);

  let w = mix(BUTTON.w, PILL.w, c);
  let h = mix(BUTTON.h, PILL.h, c);
  const r = mix(BUTTON.r, PILL.r, cLin);
  let y = 540 + mix(BUTTON.cy, 0, cLin) * cam;
  w = mix(w * cam, SHEET.w, sh);
  h = mix(h * cam, SHEET.h, sh);
  y = mix(y, SHEET_RECT.y, sh);
  const rTop = mix(r, 80, shLin);
  const rBottom = mix(r, 0, shLin);

  const loaderOut = 1 - ramp(t, [S.collapse[0], S.collapse[0] + 0.12]);
  const pillContent = ramp(t, [S.collapse[0] + 0.14, S.collapse[0] + 0.34]) * (1 - ramp(t, [S.toSheet[0], S.toSheet[0] + 0.1]));
  const sheetIn = ramp(t, [S.toSheet[0] + 0.02, S.toSheet[0] + 0.1]);

  const bgReady = t >= S.collapse[0] + 0.22;
  const backdrop = ramp(t, [S.toSheet[0], S.toSheet[1]]);

  return (
    <AbsoluteFill style={{ background: bgReady ? mixColor(S4_CANVAS, C.sheetBackdrop, backdrop) : "transparent" }}>
      <div
        style={{
          position: "absolute",
          left: 960 - w / 2,
          top: y - h / 2,
          width: w,
          height: h,
          borderRadius: `${rTop}px ${rTop}px ${rBottom}px ${rBottom}px`,
          background: mixColor(C.black, C.white, ramp(t, [S.collapse[0], S.collapse[0] + 0.08])),
          border: `${3 * cLin * (1 - shLin)}px solid ${C.border}`,
          boxSizing: "border-box",
          boxShadow: `0 ${mix(16, 34, cLin)}px ${mix(30, 80, cLin)}px rgba(0,0,0,${mix(0.25, 0.1, cLin)})`,
          transform: `perspective(1400px) rotateX(${28 * tilt}deg) rotateY(${-22 * tilt}deg) rotateZ(${8 * tilt}deg) skewX(${-8 * tilt}deg)`,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "absolute", opacity: loaderOut }}>
          <SwooshLoader size={60} t={t - T.s4.loader} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: pillContent, filter: `blur(${mix(10, 0, pillContent)}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 66, letterSpacing: "-0.035em", color: C.black }}>
            {brand.copy.converting}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 34, color: C.muted, marginTop: 6 }}>{brand.copy.convertingSub}</div>
          <div style={{ marginTop: 30, width: 680, height: 14, borderRadius: 7, background: "#EDEDED", overflow: "hidden" }}>
            <div style={{ width: `${fillAt(t) * 100}%`, height: "100%", borderRadius: 7, background: C.black }} />
          </div>
        </div>

        {/* Spenda's success sheet */}
        <div style={{ position: "absolute", left: 0, top: 0, width: SHEET.w, height: SHEET.h, opacity: sheetIn }}>
          <SuccessSheet
            ring={ramp(t, [S.ringDraw[0], S.ringDraw[1]])}
            check={ramp(t, [S.checkDraw[0], S.checkDraw[1]])}
            textP={ramp(t, [S.textIn, S.textIn + 0.3])}
          />
        </div>
      </div>

      <Confetti t={t} start={S.confetti} x={CHECK_CENTER.x} y={CHECK_CENTER.y} />
    </AbsoluteFill>
  );
};
