import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { brand } from "../brand";
import { T } from "../timeline";
import { FONT } from "../components/fonts";
import { SwooshLoader } from "../components/SwooshLoader";
import { clamp, easeInOut, mix, mixColor, pop, ramp, useSceneTime } from "../components/motion";
import { BUTTON, CARD_CAM_END } from "./ConversionCard";
import { SwapText } from "./DepositPill";

const G = T.progress;
const C = brand.colors;

export const PILL = { w: 900, h: 250, r: 46, border: 3 };
export const BAR = { w: 660, h: 14 };

// Progress that rushes, stalls a little, then finishes.
const fillAt = (t: number) =>
  interpolate(
    t,
    [G.fill[0], G.fill[0] + 0.25, G.fill[0] + 0.55, G.fill[1]],
    [0, 0.48, 0.66, 1],
    { ...clamp, easing: easeInOut },
  );

export const PillTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 64,
      letterSpacing: "-0.03em",
      color: C.text,
      lineHeight: 1.1,
      textAlign: "center",
    }}
  >
    {children}
  </div>
);

export const Progress: React.FC = () => {
  const t = useSceneTime(G.start);

  const c = pop(t, G.collapse[0], { damping: 16, stiffness: 140 });
  const cLin = ramp(t, [G.collapse[0], G.collapse[1]], easeInOut);
  const w = mix(BUTTON.w, PILL.w, c);
  const h = mix(BUTTON.h, PILL.h, c);
  const r = mix(BUTTON.r, PILL.r, cLin);
  const y = mix(BUTTON.cy, 0, cLin);
  const cam = mix(CARD_CAM_END, 1, cLin);

  // 3D tilt that rises to a peak and settles back flat (reference 6.5-7.25s).
  const tilt = interpolate(t, [G.collapse[0], G.tiltPeak, G.tiltSettle], [0, 1, 0], {
    ...clamp,
    easing: easeInOut,
  });

  const loaderOut = 1 - ramp(t, [G.collapse[0], G.collapse[0] + 0.12]);
  const contentIn = ramp(t, [G.collapse[0] + 0.18, G.collapse[0] + 0.42]);

  const fill = fillAt(t);
  const done = ramp(t, [G.complete, G.complete + 0.14]);
  const bounce = t >= G.complete ? mix(0.9, 1, pop(t, G.complete, { damping: 9, stiffness: 260 })) : 1;

  const bgReady = t >= T.card.collapseEnd;

  return (
    <AbsoluteFill style={{ background: bgReady ? C.canvas : "transparent" }}>
      <AbsoluteFill style={{ scale: String(cam) }}>
        <div
          style={{
            position: "absolute",
            left: 960 - w / 2,
            top: 540 + y - h / 2,
            width: w,
            height: h,
            borderRadius: r,
            background: mixColor(C.brand, C.white, cLin),
            border: `${PILL.border * cLin}px solid ${mixColor(C.brand, C.border, cLin)}`,
            boxShadow: `0 ${mix(14, 30, cLin)}px ${mix(30, 70, cLin)}px rgba(0,0,0,${mix(0.25, 0.1, cLin)})`,
            transform: `perspective(1400px) rotateX(${30 * tilt}deg) rotateY(${-24 * tilt}deg) rotateZ(${9 * tilt}deg)`,
            scale: String(bounce),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", opacity: loaderOut }}>
            <SwooshLoader size={58} t={t - T.card.loader} />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              opacity: contentIn,
              filter: `blur(${mix(10, 0, contentIn)}px)`,
            }}
          >
            <SwapText
              from={<PillTitle>{brand.copy.converting}</PillTitle>}
              to={<PillTitle>{brand.copy.complete}</PillTitle>}
              p={done}
              distance={40}
            />
            <div
              style={{
                fontFamily: FONT,
                fontSize: 34,
                color: C.muted,
                marginTop: 6,
                opacity: 1 - done,
                height: mix(42, 8, done),
              }}
            >
              {brand.copy.convertingSub}
            </div>
            <div
              style={{
                marginTop: 30,
                width: BAR.w,
                height: BAR.h,
                borderRadius: BAR.h / 2,
                background: mixColor("#EDEDED", C.success, done),
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${fill * 100}%`,
                  height: "100%",
                  borderRadius: BAR.h / 2,
                  background: mixColor(C.loading, C.success, done),
                }}
              />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
