import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { Ripple } from "../components/Ripple";
import { HOME_LAYOUT, SpendaHome } from "../screens/SpendaHome";
import { homeState } from "./phoneState";
import { prog } from "../anim";
import { dur, scenes, t } from "../timeline";

export const S7Deposit: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s7.from;
  const ripple = prog(abs, t.tapDeposit, t.tapDeposit + 14, (x) => x);
  const { x, y } = HOME_LAYOUT.depositCenter;
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <>
            <SpendaHome {...homeState(abs)} />
            <Ripple p={ripple} x={x} y={y} size={70} color={brand.colors.primary} />
          </>
        }
      />
      <StepLabel line1="Tap" line2="Deposit Naira" side="right" inset={150} start={8} exit={dur(scenes.s7) - 8} />
    </AbsoluteFill>
  );
};
