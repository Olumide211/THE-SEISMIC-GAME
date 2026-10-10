import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { Coin } from "../components/Coin";
import { SpendaHome } from "../screens/SpendaHome";
import { NotificationBanner } from "../screens/NotificationBanner";
import { CONVERT_LAYOUT, ConvertScreen } from "../screens/ConvertScreen";
import { convertState, homeState, sheetState } from "./phoneState";
import { EASE, prog } from "../anim";
import { dur, scenes, t } from "../timeline";

const HOLD = 6;
const WIPE = 9;

/** ₦ coins arc across the gap between the From and To cards, flipping into USDT. */
const CoinArc: React.FC<{ abs: number }> = ({ abs }) => (
  <>
    {[0, 1, 2].map((i) => {
      const start = t.coins + i * 4;
      const p = prog(abs, start, start + 14, EASE);
      if (p <= 0 || p >= 1) return null;
      const x0 = 300, y0 = CONVERT_LAYOUT.fromTop + 82;
      const x1 = 300, y1 = CONVERT_LAYOUT.toTop + 66;
      const cx = 390, cy = (y0 + y1) / 2;
      const x = (1 - p) ** 2 * x0 + 2 * (1 - p) * p * cx + p ** 2 * x1;
      const y = (1 - p) ** 2 * y0 + 2 * (1 - p) * p * cy + p ** 2 * y1;
      const flip = Math.abs(Math.cos(p * Math.PI));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - 18,
            top: y - 18,
            transform: `scaleX(${Math.max(0.08, flip)}) scale(${1 + Math.sin(p * Math.PI) * 0.35})`,
            opacity: Math.min(1, p * 6, (1 - p) * 6),
            zIndex: 5,
            filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.2))",
          }}
        >
          <Coin kind={p < 0.5 ? "NGN" : "USDT"} size={36} />
        </div>
      );
    })}
  </>
);

export const S9Convert: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s9.from;
  const c = convertState(abs);
  const total = dur(scenes.s9);
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <TransitionSeries>
            <TransitionSeries.Sequence durationInFrames={HOLD + WIPE}>
              <SpendaHome {...homeState(scenes.s9.from)} />
              <NotificationBanner progress={sheetState(abs).banner} />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: WIPE })} />
            <TransitionSeries.Sequence durationInFrames={total - HOLD}>
              <ConvertScreen
                fromAmount={c.fromAmount}
                toAmount={c.toAmount}
                caret={c.caret}
                swapRotation={c.swapRotation}
                overlay={<CoinArc abs={abs} />}
              />
            </TransitionSeries.Sequence>
          </TransitionSeries>
        }
      />
      <StepLabel line1="Convert to" line2="Stablecoins" side="right" inset={150} start={10} exit={total - 8} />
    </AbsoluteFill>
  );
};
