import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { brand, formatNgn } from "../brand";
import { ApproxGlyph, ArrowGlyph } from "../components/Glyphs";
import { T } from "../timeline";
import { Cursor, Ripple } from "../components/Cursor";
import { FONT } from "../components/fonts";
import { ArrowUpRight, NairaBadge, Radio, SwapIcon } from "../components/Icons";
import { SpendaMark } from "../components/Logo";
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
import { ICON_SIZE } from "./Letters";

const P = T.pill;
const C = brand.colors;

// Final convert-row geometry, shared with the card scene so the morph is seamless.
export const ROW = { w: 860, h: 156, r: 24, y: 40 };
export const ROW_RADIO_X = ROW.w / 2 - 62;

// Gentle camera push across the scene; the card scene continues from CAM_END.
export const CAM_END = 1.035;
const camAt = (t: number) => interpolate(t, [P.start, P.end], [1, CAM_END], clamp);

const CURSOR_FROM = { x: 1560, y: 1180 };
const cursorTarget = {
  x: 960 + ROW_RADIO_X * camAt(P.click) - 6,
  y: 540 + ROW.y * camAt(P.click) - 4,
};
const cursorX = (t: number) =>
  interpolate(t, [P.cursorIn[0], P.cursorIn[1]], [CURSOR_FROM.x, cursorTarget.x], { ...clamp, easing: easeOut });
const cursorY = (t: number) =>
  interpolate(t, [P.cursorIn[0], P.cursorIn[1]], [CURSOR_FROM.y, cursorTarget.y], {
    ...clamp,
    easing: (n) => easeOut(Math.min(1, n * 1.08)),
  });

export const RowPrimary: React.FC<{ ngn: number }> = ({ ngn }) => (
  <span>
    {formatNgn(ngn)}
    <ArrowGlyph />
    USDT
  </span>
);

const RowSecondary: React.FC = () => (
  <span>
    Rate: 1 USDT
    <ApproxGlyph />
    {formatNgn(brand.amounts.rate)} · Fee {formatNgn(brand.amounts.feeNgn)}
  </span>
);

// Text that swaps by sliding up with a blur, the reference's label morph.
export const SwapText: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  p: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ from, to, p, distance = 36, style }) => (
  <div style={{ position: "relative", display: "grid", ...style }}>
    <div
      style={{
        gridArea: "1 / 1",
        opacity: 1 - p,
        translate: `0 ${-distance * p}px`,
        filter: `blur(${8 * p}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {from}
    </div>
    <div
      style={{
        gridArea: "1 / 1",
        opacity: p,
        translate: `0 ${distance * (1 - p)}px`,
        filter: `blur(${8 * (1 - p)}px)`,
        whiteSpace: "nowrap",
      }}
    >
      {to}
    </div>
  </div>
);

export const RowContent: React.FC<{
  primary: React.ReactNode;
  pressed: number;
  radio: number;
  style?: React.CSSProperties;
}> = ({ primary, pressed, radio, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      padding: "0 44px",
      gap: 30,
      ...style,
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 32,
        background: mixColor(C.white, "rgba(255,255,255,0.2)", pressed),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
      }}
    >
      <SwapIcon size={34} color={mixColor(C.black, C.white, pressed)} />
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: "-0.02em",
          color: mixColor(C.text, C.white, pressed),
          lineHeight: 1.05,
        }}
      >
        {primary}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 400,
          fontSize: 27,
          color: mixColor(C.muted, "rgba(255,255,255,0.8)", pressed),
          lineHeight: 1.1,
        }}
      >
        <RowSecondary />
      </div>
    </div>
    <Radio size={46} filled={radio} color={mixColor(C.black, "#222", pressed)} />
  </div>
);

export const DepositPill: React.FC = () => {
  const t = useSceneTime(P.start);

  // Phase A: icon -> navy pill
  const a = ramp(t, [P.toPill[0], P.toPill[1]], easeInOut);
  const aPop = pop(t, P.toPill[0], { damping: 13 });
  // Phase B: navy -> light pill with "Deposit Naira"
  const b = ramp(t, [P.toLight[0], P.toLight[1]], easeInOut);
  // Phase C: pill -> convert row panel
  const c = pop(t, P.toPanel[0], { damping: 15, stiffness: 170 });
  const cLin = ramp(t, [P.toPanel[0], P.toPanel[1]], easeInOut);

  const pillW = mix(ICON_SIZE, 560, aPop);
  const pillH = mix(ICON_SIZE, 124, a);
  const w = mix(pillW, ROW.w, c);
  const h = mix(pillH, ROW.h, c);
  const r = mix(mix(ICON_SIZE * 0.24, 62, a), ROW.r, cLin);
  const y = mix(0, ROW.y, cLin);
  const bg = mixColor(mixColor(C.brand, C.pill, b), C.panel, cLin);

  // Click
  const clicked = t >= P.click;
  const pressed = ramp(t, [P.click, P.click + 0.12]);
  const clickDip = clicked ? 1 - 0.035 * Math.sin(Math.min(1, (t - P.click) / 0.16) * Math.PI) : 1;

  // Amount cycling in the row
  const cycle = brand.amounts.cycle;
  const swap1 = ramp(t, [P.cycleSwaps[0], P.cycleSwaps[0] + 0.16]);
  const swap2 = ramp(t, [P.cycleSwaps[1], P.cycleSwaps[1] + 0.16]);
  const primary =
    t < P.cycleSwaps[1] ? (
      <SwapText from={<RowPrimary ngn={cycle[0]} />} to={<RowPrimary ngn={cycle[1]} />} p={swap1} distance={30} />
    ) : (
      <SwapText from={<RowPrimary ngn={cycle[1]} />} to={<RowPrimary ngn={cycle[2]} />} p={swap2} distance={30} />
    );

  const dotsIn = ramp(t, [P.toLight[0], P.toLight[1]]);
  const decorOut = 1 - ramp(t, [P.toPanel[0], P.toPanel[0] + 0.12]);
  const headerP = pop(t, P.headerIn, { damping: 12 });
  const rowIn = ramp(t, [P.toPanel[0] + 0.1, P.toPanel[1]]);

  const cam = camAt(t);

  const cx = cursorX(t);
  const cy = cursorY(t);
  const vx = speed(cursorX, t);
  const vy = speed(cursorY, t);

  return (
    <AbsoluteFill style={{ background: C.canvas }}>
      <AbsoluteFill style={{ scale: String(cam), alignItems: "center", justifyContent: "center" }}>
        {/* Header that drops in above the row */}
        <div
          style={{
            position: "absolute",
            top: 540 + ROW.y - ROW.h / 2 - 92,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: ramp(t, [P.headerIn, P.headerIn + 0.08]),
            translate: `0 ${mix(-60, 0, headerP)}px`,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: "-0.02em",
            color: C.text,
          }}
        >
          {brand.copy.convertHeader}
          <div style={{ rotate: `${mix(-40, 0, headerP)}deg` }}>
            <ArrowUpRight size={34} />
          </div>
        </div>

        {/* The morphing container */}
        <div
          style={{
            position: "absolute",
            left: 960 - w / 2,
            top: 540 + y - h / 2,
            width: w,
            height: h,
            borderRadius: r,
            background: mixColor(bg, C.pressed, pressed),
            boxShadow: `0 ${mix(28, 14, b)}px ${mix(60, 40, b)}px rgba(0,0,0,${mix(0.22, 0.1, b)}), 0 0 0 ${mix(0, 10, b * decorOut)}px rgba(255,255,255,0.9)`,
            scale: String(clickDip),
            overflow: "hidden",
          }}
        >
          {/* Icon mark fading out */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1 - ramp(t, [P.toPill[0], P.toPill[0] + 0.1]),
            }}
          >
            <SpendaMark size={ICON_SIZE} bg="transparent" />
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
              color: mixColor(C.white, C.text, b),
              opacity: ramp(t, [P.toPill[0] + 0.08, P.toPill[1]]) * decorOut,
            }}
          >
            <SwapText from={brand.name} to={brand.copy.deposit} p={b} />
          </div>
          <RowContent primary={primary} pressed={pressed} radio={pressed} style={{ opacity: rowIn }} />
        </div>

        {/* ₦ badge beside the pill */}
        <div
          style={{
            position: "absolute",
            left: 960 + w / 2 + 34,
            top: 540 - 38,
            scale: String(pop(t, P.toLight[0] + 0.08)),
            opacity: decorOut,
          }}
        >
          <NairaBadge size={76} />
        </div>

        {/* Three pulsing dots */}
        <div
          style={{
            position: "absolute",
            top: 540 + h / 2 + 30,
            display: "flex",
            gap: 14,
            opacity: dotsIn * decorOut,
          }}
        >
          {[0, 1, 2].map((i) => {
            const phase = Math.sin((t * 7 - i * 0.9) * 1.0);
            const on = 0.5 + 0.5 * phase;
            return (
              <div
                key={i}
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 7,
                  background: mixColor("#C9C9C9", "#555555", on),
                  scale: String(mix(0.85, 1.2, on)),
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Cursor (outside the camera so it moves in screen space) */}
      <Ripple x={cursorTarget.x} y={cursorTarget.y} p={ramp(t, [P.click, P.click + 0.35])} />
      {t >= P.cursorIn[0] && (
        <Cursor
          x={cx}
          y={cy}
          scale={clicked ? mix(0.82, 1, ramp(t, [P.click + 0.04, P.click + 0.16])) : 1}
          blurX={blurFromSpeed(vx, 0.35)}
          blurY={blurFromSpeed(vy, 0.35)}
        />
      )}
    </AbsoluteFill>
  );
};
