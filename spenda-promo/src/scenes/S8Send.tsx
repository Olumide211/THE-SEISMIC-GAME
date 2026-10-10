import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { SpendaHome } from "../screens/SpendaHome";
import { DepositNairaSheet } from "../screens/DepositNairaSheet";
import { NotificationBanner } from "../screens/NotificationBanner";
import { homeState, sheetState } from "./phoneState";
import { dur, scenes } from "../timeline";

export const S8Send: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s8.from;
  const sheet = sheetState(abs);
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <>
            <SpendaHome {...homeState(abs)} />
            <DepositNairaSheet progress={sheet.progress} highlight={sheet.highlight} copyTap={sheet.copyTap} toast={sheet.toast} />
            <NotificationBanner progress={sheet.banner} />
          </>
        }
      />
      <StepLabel line1="Send Naira" line2="to your account" side="left" inset={150} start={4} exit={dur(scenes.s8) - 8} />
    </AbsoluteFill>
  );
};
