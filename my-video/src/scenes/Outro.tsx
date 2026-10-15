import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random } from "remotion";
import { brand, usdtAmount } from "../brand";
import { FPS, T } from "../timeline";
import { MiniCoin } from "../components/Coin3D";
import { FONT } from "../components/fonts";
import { SpendaWordmark } from "../components/Logo";
import { clamp, easeIn, easeInOut, easeOut, mix, pop, ramp, useSceneTime } from "../components/motion";
import { BAR, PILL, PillTitle } from "./Progress";
import { SwapText } from "./DepositPill";

const O = T.outro;
const C = brand.colors;
const SLICES = 9;

const zoomAt = (t: number) =>
  interpolate(t, [O.zoom[0], O.zoom[1]], [1, 46], { ...clamp, easing: easeIn });

const P2P: React.FC = () => (
  <span
    style={{
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 130,
      letterSpacing: "-0.03em",
      color: "#8E8E8E",
      lineHeight: 1,
    }}
  >
    {brand.copy.oldWay}
  </span>
);

const Mark: React.FC = () => <SpendaWordmark size={118} />;

const Centered: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

// Horizontal slice glitch that swaps "P2P" for the Spenda wordmark slice by slice.
const Glitch: React.FC<{ t: number }> = ({ t }) => {
  const p = ramp(t, [O.glitch[0], O.glitch[1]], (n) => n);
  const frame = Math.floor(t * FPS);
  const band = 100 / SLICES;
  const split = 12 * Math.sin(p * Math.PI);
  return (
    <>
      {new Array(SLICES).fill(0).map((_, i) => {
        const seed = `${i}-${frame}`;
        const swapped = random(`swap${i}`) * 0.75 + 0.1 < p;
        const offset = (random(`off${seed}`) - 0.5) * 140 * Math.sin(p * Math.PI);
        const clip = `inset(${(i * band).toFixed(2)}% -20% ${(100 - (i + 1) * band).toFixed(2)}% -20%)`;
        return (
          <Centered
            key={i}
            style={{
              clipPath: clip,
              translate: `${offset}px 0`,
              // RGB split
              filter: `drop-shadow(${-split}px 0 0 rgba(255,0,72,0.75)) drop-shadow(${split}px 0 0 rgba(0,210,255,0.75))`,
            }}
          >
            {swapped ? <Mark /> : <P2P />}
          </Centered>
        );
      })}
      {/* The bright slicing line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 540 + (random(`line${frame}`) - 0.5) * 120,
          height: 6,
          background: "white",
          opacity: 0.9 * Math.sin(p * Math.PI),
          boxShadow: "0 0 20px rgba(255,255,255,0.8)",
        }}
      />
    </>
  );
};

export const Outro: React.FC = () => {
  const t = useSceneTime(O.start);

  // Pill: "Conversion Complete" -> "36.85 USDT received" with a coin, then zoom through
  const rec = ramp(t, [O.received[0], O.received[1]], easeInOut);
  const coinPop = pop(t, O.received[0] + 0.06, { damping: 10 });
  const h = mix(PILL.h, 200, rec);
  const zoom = zoomAt(t);
  const zoomBlur = Math.min(18, Math.abs(zoomAt(t) - zoomAt(t - 1 / FPS)) * 1.6);
  const pillVisible = t < O.toBlack[0];

  // White -> gray -> black
  const darkP = ramp(t, [O.toBlack[0], O.toBlack[1]], easeOut);
  const bg = interpolateColors(darkP, [0, 0.45, 1], [C.canvas, "#7F7F7F", C.black]);
  const p2pIn = ramp(t, [O.toBlack[0] + 0.1, O.toBlack[1] + 0.05]);

  const glitching = t >= O.glitch[0] && t < O.glitch[1];
  const after = t >= O.glitch[1];
  const settle = after ? pop(t, O.glitch[1], { damping: 12 }) : 0;
  const tag = ramp(t, [O.tagline, O.tagline + 0.4]);

  return (
    <AbsoluteFill style={{ background: pillVisible ? C.canvas : bg }}>
      {pillVisible && (
        <Centered>
          <div
            style={{
              width: PILL.w,
              height: h,
              borderRadius: PILL.r,
              background: C.white,
              border: `${PILL.border}px solid ${C.border}`,
              boxShadow: "0 30px 70px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(zoom),
              filter: `blur(${zoomBlur}px)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 58,
                scale: String(coinPop),
                rotate: `${mix(-90, 0, coinPop)}deg`,
                opacity: rec * (1 - ramp(t, [O.zoom[0] + 0.18, O.zoom[1] - 0.06])),
              }}
            >
              <MiniCoin size={92} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                translate: `${mix(0, 56, rec)}px 0`,
                // Text clears mid-zoom so the screen fills with pure white.
                opacity: 1 - ramp(t, [O.zoom[0] + 0.18, O.zoom[1] - 0.06]),
              }}
            >
              <SwapText
                from={<PillTitle>{brand.copy.complete}</PillTitle>}
                to={<PillTitle>{`${usdtAmount()} USDT received`}</PillTitle>}
                p={rec}
                distance={40}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 32,
                  color: C.muted,
                  opacity: rec,
                  height: mix(0, 42, rec),
                  marginTop: mix(0, 4, rec),
                  overflow: "hidden",
                }}
              >
                {brand.copy.receivedSub}
              </div>
              <div
                style={{
                  marginTop: mix(30, 0, rec),
                  width: BAR.w,
                  height: mix(BAR.h, 0, rec),
                  borderRadius: BAR.h / 2,
                  background: C.success,
                  opacity: 1 - rec,
                }}
              />
            </div>
          </div>
        </Centered>
      )}

      {!pillVisible && !glitching && !after && (
        <Centered style={{ opacity: p2pIn }}>
          <P2P />
        </Centered>
      )}

      {glitching && <Glitch t={t} />}

      {after && (
        <>
          <Centered
            style={{
              scale: String(mix(1.06, 1, settle)),
              translate: `0 ${mix(0, -40, tag)}px`,
            }}
          >
            <Mark />
          </Centered>
          <Centered>
            <div
              style={{
                marginTop: 190,
                fontFamily: FONT,
                fontWeight: 400,
                fontSize: 38,
                color: "#9A9A9A",
                letterSpacing: "-0.005em",
                opacity: tag,
                translate: `0 ${mix(24, 0, tag)}px`,
                filter: `blur(${mix(8, 0, tag)}px)`,
              }}
            >
              {brand.copy.tagline}
              <span style={{ color: "#5E5E5E" }}>{"  ·  "}</span>
              <span style={{ color: C.white, fontWeight: 600 }}>{brand.hashtag}</span>{" "}
              <span style={{ color: C.white, fontWeight: 600 }}>{brand.handle}</span>
            </div>
          </Centered>
        </>
      )}
    </AbsoluteFill>
  );
};
