import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { brand, usdtAmount } from "../brand";
import { T } from "../timeline";
import { Coin3D } from "../components/Coin3D";
import { Cursor, Ripple } from "../components/Cursor";
import { FONT } from "../components/fonts";
import { SpendaMark } from "../components/Logo";
import { SwooshLoader } from "../components/SwooshLoader";
import {
  blurFromSpeed,
  clamp,
  easeInOut,
  easeOut,
  mix,
  mixColor,
  pop,
  ramp,
  speed,
  useSceneTime,
} from "../components/motion";
import { CAM_END, ROW, RowContent, RowPrimary } from "./DepositPill";

const K = T.card;
const C = brand.colors;

// Card geometry (shared with the progress scene).
export const CARD = { w: 1200, h: 660, r: 30 };
export const BUTTON = { w: 860, h: 104, r: 20, cy: 222 };
export const CARD_CAM_END = 1.09;

const camAt = (t: number) => interpolate(t, [K.zoom[0], K.zoom[1]], [CAM_END, CARD_CAM_END], clamp);

const CURSOR_FROM = { x: 1700, y: 1160 };
const target = {
  x: 960 + 230 * camAt(K.click),
  y: 540 + (BUTTON.cy + 10) * camAt(K.click),
};
const cursorX = (t: number) =>
  interpolate(t, [K.cursorIn[0], K.cursorIn[1]], [CURSOR_FROM.x, target.x], { ...clamp, easing: easeOut });
const cursorY = (t: number) =>
  interpolate(t, [K.cursorIn[0], K.cursorIn[1]], [CURSOR_FROM.y, target.y], { ...clamp, easing: easeOut });

const Field: React.FC<{ label: string; value: string; square?: boolean; p: number }> = ({
  label,
  value,
  square,
  p,
}) => (
  <div
    style={{
      width: 500,
      height: 96,
      borderRadius: 18,
      background: C.field,
      display: "flex",
      alignItems: "center",
      gap: 22,
      padding: "0 26px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      opacity: p,
      translate: `${mix(-40, 0, p)}px 0`,
    }}
  >
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: square ? 5 : 13,
        border: `6px solid ${C.black}`,
        background: square ? C.black : C.white,
      }}
    />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: FONT, fontSize: 22, color: C.muted, lineHeight: 1 }}>{label}</span>
      <span
        style={{
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: C.text,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  </div>
);

export const ConversionCard: React.FC = () => {
  const t = useSceneTime(K.start);

  const m = pop(t, K.morph[0], { damping: 15, stiffness: 160 });
  const mLin = ramp(t, [K.morph[0], K.morph[1]], easeInOut);
  // After K.end the card collapses into its button; the progress scene draws the button on top.
  const col = ramp(t, [K.end, K.collapseEnd], easeInOut);
  const w = mix(mix(ROW.w, CARD.w, m), BUTTON.w, col);
  const h = mix(mix(ROW.h, CARD.h, m), BUTTON.h, col);
  const r = mix(ROW.r, CARD.r, mLin);
  const y = mix(mix(ROW.y, 0, mLin), BUTTON.cy, col);
  const contentOut = 1 - ramp(t, [K.end, K.end + 0.1]);
  const buttonHidden = t >= K.end;
  const cam = camAt(t);

  const stagger = (i: number) => ramp(t, [K.contentIn + i * 0.05, K.contentIn + i * 0.05 + 0.22]);

  // Coin: drops in, spins from the ₦ face to the USDT face, then sways
  const drop = pop(t, K.coinDrop, { damping: 9, stiffness: 150 });
  const spinP = ramp(t, [K.coinFlip[0], K.coinFlip[1]]);
  const sway = t > K.coinFlip[1] ? 14 * Math.sin((t - K.coinFlip[1]) * 3.2) : 0;
  const spin = mix(0, 900, spinP) + sway;
  const coinIn = ramp(t, [K.coinDrop, K.coinDrop + 0.08]);

  // Button click + loader
  const clicked = t >= K.click;
  const pressed = ramp(t, [K.click, K.click + 0.1]) * (1 - ramp(t, [K.loader + 0.05, K.loader + 0.25]));
  const loaderOn = t >= K.loader;
  const btnDip = clicked ? 1 - 0.04 * Math.sin(Math.min(1, (t - K.click) / 0.18) * Math.PI) : 1;

  const cx = cursorX(t);
  const cy = cursorY(t);
  const cursorFade = 1 - ramp(t, [K.loader + 0.15, K.loader + 0.3]);

  return (
    <AbsoluteFill style={{ background: C.canvas }}>
      <AbsoluteFill style={{ scale: String(cam), opacity: 1 - col }}>
        <div
          style={{
            position: "absolute",
            left: 960 - w / 2,
            top: 540 + y - h / 2,
            width: w,
            height: h,
            borderRadius: r,
            background: mixColor(C.pressed, C.panel, ramp(t, [K.morph[0], K.morph[0] + 0.18])),
            boxShadow: "0 40px 80px rgba(0,0,0,0.12), 0 10px 24px rgba(0,0,0,0.06)",
            // Clip only while the row content is still inside; the coin drops in from above.
            overflow: t < K.coinDrop ? "hidden" : "visible",
          }}
        >
          {/* Row content dissolving as the card opens */}
          <RowContent
            primary={<RowPrimary ngn={brand.amounts.ngn} />}
            pressed={1 - mLin}
            radio={1}
            style={{ opacity: 1 - ramp(t, [K.morph[0], K.morph[0] + 0.1]), width: ROW.w, height: ROW.h, left: (w - ROW.w) / 2, top: (h - ROW.h) / 2 }}
          />

          {/* Card content, laid out on the final card size and centered */}
          <div
            style={{
              position: "absolute",
              left: (w - CARD.w) / 2,
              top: (h - CARD.h) / 2,
              width: CARD.w,
              height: CARD.h,
              opacity: contentOut,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 40,
                top: 34,
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: stagger(0),
              }}
            >
              <SpendaMark size={42} />
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: "-0.02em" }}>
                {brand.name}
              </span>
            </div>

            <div
              style={{
                position: "absolute",
                top: 58,
                width: "100%",
                textAlign: "center",
                opacity: stagger(1),
                translate: `0 ${mix(-24, 0, stagger(1))}px`,
              }}
            >
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 56, letterSpacing: "-0.03em", color: C.text }}>
                {brand.copy.cardTitle}
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 30, color: C.muted, marginTop: 4 }}>
                {brand.copy.cardSubtitle}
              </div>
            </div>

            <div style={{ position: "absolute", left: 70, top: 236, display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label={brand.copy.fromLabel} value={`NGN ${new Intl.NumberFormat("en-US").format(brand.amounts.ngn)}`} square p={stagger(2)} />
              <Field label={brand.copy.toLabel} value={`USDT ${usdtAmount()}`} p={stagger(3)} />
            </div>

            {/* 3D coin replaces the car */}
            <div
              style={{
                position: "absolute",
                left: 800,
                top: 196,
                opacity: coinIn,
                translate: `0 ${mix(-560, 0, drop)}px`,
              }}
            >
              <Coin3D size={250} spin={spin} tiltX={14} tiltZ={-12} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 835,
                top: 462,
                width: 180,
                height: 26,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(0,0,0,0.28) 0%, transparent 70%)",
                opacity: coinIn * drop,
                scale: String(mix(0.3, 1, drop)),
              }}
            />

            {/* Brand-color action button */}
            <div
              style={{
                position: "absolute",
                left: (CARD.w - BUTTON.w) / 2,
                top: CARD.h / 2 + BUTTON.cy - BUTTON.h / 2,
                width: BUTTON.w,
                height: BUTTON.h,
                borderRadius: BUTTON.r,
                background: mixColor(C.brand, C.brandPressed, pressed),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: buttonHidden ? 0 : stagger(4),
                translate: `0 ${mix(30, 0, stagger(4))}px`,
                scale: String(btnDip),
                boxShadow: "0 14px 30px rgba(26,58,92,0.3)",
              }}
            >
              {loaderOn ? (
                <SwooshLoader size={58} t={t - K.loader} />
              ) : (
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 42, color: C.white, letterSpacing: "-0.01em" }}>
                  {brand.copy.button}
                </span>
              )}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <Ripple x={target.x} y={target.y} p={ramp(t, [K.click, K.click + 0.35])} color="rgba(255,255,255,0.45)" />
      {t >= K.cursorIn[0] && (
        <Cursor
          x={cx}
          y={cy}
          opacity={cursorFade}
          scale={clicked ? mix(0.82, 1, ramp(t, [K.click + 0.04, K.click + 0.16])) : 1}
          blurX={blurFromSpeed(speed(cursorX, t), 0.35)}
          blurY={blurFromSpeed(speed(cursorY, t), 0.35)}
        />
      )}
    </AbsoluteFill>
  );
};
