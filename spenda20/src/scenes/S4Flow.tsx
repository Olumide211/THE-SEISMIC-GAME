import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { brand, formatNgn, formatNgnPlain, usdtAmount } from "../brand";
import { T } from "../timeline";
import { Coin } from "../components/Coin";
import { Cursor, Ripple } from "../components/Cursor";
import { FONT } from "../components/fonts";
import { ApproxGlyph, ArrowGlyph } from "../components/Glyphs";
import { ArrowUpRight, NairaBadge, Radio, SwapIcon } from "../components/Icons";
import { SpendaLogo } from "../components/Logo";
import { Pill } from "../components/Pill";
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
  tapDip,
  useSceneTime,
} from "../components/motion";

const S = T.s4;
const C = brand.colors;

export const S4_CANVAS = "#FAFAFA";
const ICON = { w: 200, h: 200, r: 48 };
const PILL = { w: 580, h: 124, r: 62 };
const CARD1 = { w: 960, h: 340, r: 32 };
const ROW = { x: 30, y: 130, w: 900, h: 176, r: 22 };
export const CARD2 = { w: 1240, h: 700, r: 34 };
export const BUTTON = { w: 920, h: 112, r: brand.radius.button, cy: 236 };
const CARD_SHADOW = "0 40px 90px rgba(0,0,0,0.10), 0 10px 24px rgba(0,0,0,0.05)";

// Screen positions the cursor aims at.
const RADIO = { x: 960 - CARD1.w / 2 + ROW.x + ROW.w - 66, y: 540 - CARD1.h / 2 + ROW.y + ROW.h / 2 };
// Slow push-in while the big card is up; the cursor target accounts for it.
export const S4_CAM_END = 1.05;
const camAt = (t: number) => interpolate(t, [S.toBig[0], S.end], [1, S4_CAM_END], clamp);
const BTN_TAP = { x: 960 + 220 * camAt(S.tap2), y: 540 + (BUTTON.cy + 12) * camAt(S.tap2) };

const path = (range: readonly [number, number], from: { x: number; y: number }, to: { x: number; y: number }) => ({
  x: (t: number) => interpolate(t, range, [from.x, to.x], { ...clamp, easing: easeOut }),
  y: (t: number) => interpolate(t, range, [from.y, to.y], { ...clamp, easing: easeOut }),
});
const c1 = path(S.cursor1, { x: 1700, y: 1180 }, RADIO);
const c2 = path(S.cursor2, { x: 1760, y: 1180 }, BTN_TAP);

const RowText: React.FC<{ ink: string; sub: string }> = ({ ink, sub }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 46, letterSpacing: "-0.02em", color: ink, lineHeight: 1.05 }}>
      {formatNgn(brand.data.ngn)}
      <ArrowGlyph />
      USDT
    </div>
    <div style={{ fontFamily: FONT, fontSize: 28, color: sub, lineHeight: 1.1 }}>
      Rate 1 USDT
      <ApproxGlyph />
      {formatNgn(brand.data.rate)} · Fee {formatNgn(brand.data.feeNgn)}
    </div>
  </div>
);

const Field: React.FC<{ label: string; value: string; square?: boolean; p: number }> = ({ label, value, square, p }) => (
  <div
    style={{
      width: 520,
      height: 104,
      borderRadius: 20,
      background: C.field,
      display: "flex",
      alignItems: "center",
      gap: 24,
      padding: "0 28px",
      opacity: p,
      translate: `${mix(-40, 0, p)}px 0`,
      filter: `blur(${mix(8, 0, p)}px)`,
    }}
  >
    <div style={{ width: 26, height: 26, borderRadius: square ? 5 : 13, border: `6px solid ${C.black}`, background: square ? C.black : C.white }} />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: FONT, fontSize: 22, color: C.muted, lineHeight: 1 }}>{label}</span>
      <span style={{ fontFamily: FONT, fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em", color: C.black, lineHeight: 1.1 }}>
        {value}
      </span>
    </div>
  </div>
);

export const S4Flow: React.FC = () => {
  const t = useSceneTime(S.start);

  // Icon -> pill
  const iconIn = mix(0.55, 1, pop(t, S.iconPop, { damping: 12 }));
  const a = pop(t, S.toPill[0], { damping: 14, stiffness: 170 });
  const aLin = ramp(t, [S.toPill[0], S.toPill[1]], easeInOut);
  // Pill -> card 1
  const b = pop(t, S.toCard[0], { damping: 15, stiffness: 170 });
  const bLin = ramp(t, [S.toCard[0], S.toCard[1]], easeInOut);
  // Card 1 -> card 2
  const c = pop(t, S.toBig[0], { damping: 15, stiffness: 160 });
  const cLin = ramp(t, [S.toBig[0], S.toBig[1]], easeInOut);
  // Card 2 collapses into its button after the scene's nominal end (S5 draws the button).
  const col = ramp(t, [S.end, S.end + 0.22], easeInOut);
  const buttonHidden = t >= S.end;

  let w = mix(ICON.w, PILL.w, a);
  let h = mix(ICON.h, PILL.h, aLin);
  let r = mix(ICON.r, PILL.r, aLin);
  w = mix(w, CARD1.w, b);
  h = mix(h, CARD1.h, b);
  r = mix(r, CARD1.r, bLin);
  w = mix(w, CARD2.w, c);
  h = mix(h, CARD2.h, c);
  r = mix(r, CARD2.r, cLin);
  w = mix(w, BUTTON.w, col);
  h = mix(h, BUTTON.h, col);
  const y = 540 + mix(0, BUTTON.cy, col);
  const bg = mixColor(mixColor(C.black, C.field, aLin), C.white, bLin);
  const scale = (t < S.toPill[0] ? iconIn : 1) * tapDip(t, S.tap1, 0.02);

  const tapped = ramp(t, [S.tap1, S.tap1 + 0.12]);
  const pillLabel = ramp(t, [S.toPill[0] + 0.08, S.toPill[1]]) * (1 - ramp(t, [S.toCard[0] + 0.08, S.toCard[0] + 0.16]));
  const decorOut = 1 - ramp(t, [S.toCard[0], S.toCard[0] + 0.12]);
  const card1In = ramp(t, [S.toCard[0] + 0.14, S.toCard[0] + 0.26]) * (1 - ramp(t, [S.toBig[0], S.toBig[0] + 0.1]));
  const headerP = pop(t, S.toCard[0] + 0.14, { damping: 12 });

  const stagger = (i: number) => ramp(t, [S.contentIn + i * 0.07, S.contentIn + i * 0.07 + 0.3]);
  const contentOut = 1 - ramp(t, [S.end, S.end + 0.1]);

  // Coin spins in on the right
  const drop = pop(t, S.coinIn[0], { damping: 10, stiffness: 150 });
  const spinP = ramp(t, [S.coinSpin[0], S.coinSpin[1]]);
  const sway = t > S.coinSpin[1] ? 12 * Math.sin((t - S.coinSpin[1]) * 3.4) : 0;
  const coinVisible = ramp(t, [S.coinIn[0], S.coinIn[0] + 0.08]);

  const btnPressed = ramp(t, [S.tap2, S.tap2 + 0.08]) * (1 - ramp(t, [S.loader, S.loader + 0.2]));

  const cam = camAt(t);

  const cur1 = t >= S.cursor1[0] && t < S.toBig[0] + 0.15;
  const cur2 = t >= S.cursor2[0] && t < S.end;

  return (
    <AbsoluteFill style={{ background: S4_CANVAS }}>
      <AbsoluteFill style={{ scale: String(cam), opacity: 1 - col }}>
        <Pill
          w={w}
          h={h}
          r={r}
          y={y}
          bg={bg}
          scale={scale}
          shadow={t < S.toCard[0] ? "0 24px 60px rgba(0,0,0,0.16), 0 0 0 10px rgba(255,255,255,0.85)" : CARD_SHADOW}
          border={bLin > 0 ? `2px solid ${mixColor(C.field, C.border, bLin)}` : undefined}
          overflow={t > S.coinIn[0] ? "visible" : "hidden"}
        >
          {/* App icon logo */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - ramp(t, [S.toPill[0], S.toPill[0] + 0.1]) }}>
            <SpendaLogo size={92} />
          </div>

          {/* Pill label */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 54,
              letterSpacing: "-0.02em",
              color: C.black,
              opacity: pillLabel,
              filter: `blur(${mix(8, 0, pillLabel)}px)`,
            }}
          >
            {brand.copy.deposit}
          </div>

          {/* Card 1: Convert + row (laid out at CARD1 size, centered) */}
          <div style={{ position: "absolute", left: (w - CARD1.w) / 2, top: (h - CARD1.h) / 2, width: CARD1.w, height: CARD1.h, opacity: card1In }}>
            <div
              style={{
                position: "absolute",
                left: 44,
                top: 38,
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 48,
                letterSpacing: "-0.03em",
                translate: `0 ${mix(-40, 0, headerP)}px`,
              }}
            >
              {brand.copy.convertHeader}
              <div style={{ rotate: `${mix(-45, 0, headerP)}deg` }}>
                <ArrowUpRight size={38} />
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                left: ROW.x,
                top: ROW.y,
                width: ROW.w,
                height: ROW.h,
                borderRadius: ROW.r,
                background: mixColor(C.field, C.black, tapped),
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "0 40px",
                scale: String(tapDip(t, S.tap1, 0.03)),
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  background: mixColor(C.white, "#262626", tapped),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SwapIcon size={36} color={mixColor(C.black, C.white, tapped)} />
              </div>
              <RowText ink={mixColor(C.black, C.white, tapped)} sub={mixColor(C.muted, "#BDBDBD", tapped)} />
              <Radio size={48} filled={tapped} color={mixColor(C.black, C.white, tapped)} />
            </div>
          </div>

          {/* Card 2: Your Conversion */}
          <div
            style={{
              position: "absolute",
              left: (w - CARD2.w) / 2,
              top: (h - CARD2.h) / 2,
              width: CARD2.w,
              height: CARD2.h,
              opacity: contentOut,
            }}
          >
            <div style={{ position: "absolute", left: 44, top: 38, display: "flex", alignItems: "center", gap: 12, opacity: stagger(0) }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: C.black, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SpendaLogo size={22} />
              </div>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: "-0.03em" }}>{brand.name}</span>
            </div>
            <div style={{ position: "absolute", top: 62, width: "100%", textAlign: "center", opacity: stagger(1), translate: `0 ${mix(14, 0, stagger(1))}px`, filter: `blur(${mix(8, 0, stagger(1))}px)` }}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 60, letterSpacing: "-0.035em" }}>{brand.copy.cardTitle}</div>
              <div style={{ fontFamily: FONT, fontSize: 32, color: C.muted, marginTop: 6 }}>{brand.copy.cardSubtitle}</div>
            </div>
            <div style={{ position: "absolute", left: 70, top: 248, display: "flex", flexDirection: "column", gap: 22 }}>
              <Field label="From" value={`NGN ${formatNgnPlain(brand.data.ngn)}`} square p={stagger(2)} />
              <Field label="To" value={`USDT ${usdtAmount()}`} p={stagger(3)} />
            </div>
            <div style={{ position: "absolute", left: 820, top: 210, opacity: coinVisible, translate: `${mix(260, 0, drop)}px ${mix(-120, 0, drop)}px` }}>
              <Coin size={270} spin={mix(-720, 0, spinP) + sway} />
            </div>
            <div
              style={{
                position: "absolute",
                left: 860,
                top: 492,
                width: 190,
                height: 26,
                borderRadius: "50%",
                background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
                opacity: coinVisible * drop,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: (CARD2.w - BUTTON.w) / 2,
                top: CARD2.h / 2 + BUTTON.cy - BUTTON.h / 2,
                width: BUTTON.w,
                height: BUTTON.h,
                borderRadius: BUTTON.r,
                background: mixColor(C.black, "#3A3A3A", btnPressed),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: buttonHidden ? 0 : stagger(4),
                translate: `0 ${mix(30, 0, stagger(4))}px`,
                scale: String(tapDip(t, S.tap2, 0.04)),
                boxShadow: "0 16px 34px rgba(0,0,0,0.25)",
              }}
            >
              {t >= S.loader ? (
                <SwooshLoader size={60} t={t - S.loader} />
              ) : (
                <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 42, color: C.white }}>{brand.copy.button}</span>
              )}
            </div>
          </div>
        </Pill>

        {/* ₦ badge and pulsing dots under the pill */}
        <div style={{ position: "absolute", left: 960 + w / 2 + 34, top: 540 - 40, scale: String(pop(t, S.toPill[0] + 0.1)), opacity: decorOut }}>
          <NairaBadge size={80} />
        </div>
        <div style={{ position: "absolute", top: 540 + h / 2 + 30, left: 960 - 34, display: "flex", gap: 14, opacity: ramp(t, [S.toPill[0] + 0.1, S.toPill[1]]) * decorOut }}>
          {[0, 1, 2].map((i) => {
            const on = 0.5 + 0.5 * Math.sin(t * 8 - i * 0.9);
            return <div key={i} style={{ width: 14, height: 14, borderRadius: 7, background: mixColor("#CFCFCF", "#4A4A4A", on), scale: String(mix(0.85, 1.2, on)) }} />;
          })}
        </div>
      </AbsoluteFill>

      <Ripple x={RADIO.x} y={RADIO.y} p={ramp(t, [S.tap1, S.tap1 + 0.35])} />
      <Ripple x={BTN_TAP.x} y={BTN_TAP.y} p={ramp(t, [S.tap2, S.tap2 + 0.35])} color="rgba(255,255,255,0.4)" />
      {cur1 && (
        <Cursor
          x={c1.x(t)}
          y={c1.y(t)}
          opacity={1 - ramp(t, [S.toBig[0], S.toBig[0] + 0.12])}
          scale={t >= S.tap1 ? mix(0.82, 1, ramp(t, [S.tap1 + 0.04, S.tap1 + 0.16])) : 1}
          blurX={blurFromSpeed(speed(c1.x, t), 0.35)}
          blurY={blurFromSpeed(speed(c1.y, t), 0.35)}
        />
      )}
      {cur2 && (
        <Cursor
          x={c2.x(t)}
          y={c2.y(t)}
          opacity={1 - ramp(t, [S.loader + 0.12, S.loader + 0.28])}
          scale={t >= S.tap2 ? mix(0.82, 1, ramp(t, [S.tap2 + 0.04, S.tap2 + 0.16])) : 1}
          blurX={blurFromSpeed(speed(c2.x, t), 0.35)}
          blurY={blurFromSpeed(speed(c2.y, t), 0.35)}
        />
      )}
    </AbsoluteFill>
  );
};
