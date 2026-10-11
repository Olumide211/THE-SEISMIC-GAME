import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { ScreenPush } from "../components/ScreenPush";
import { HomeScreen } from "../screens/HomeScreen";
import { DepositCryptoScreen } from "../screens/DepositCryptoScreen";
import { NotificationBanner } from "../screens/NotificationBanner";
import { bannerState, depositState, homeState } from "./phoneState";
import { dur, scenes, t } from "../timeline";

export const S8Credited: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s8.from;
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <>
            <ScreenPush abs={abs} at={t.toHome} direction={-1} from={<DepositCryptoScreen {...depositState(abs)} />} to={<HomeScreen {...homeState(abs)} />} />
            <NotificationBanner progress={bannerState(abs)} />
          </>
        }
      />
      <StepLabel line1="Naira lands" line2="in seconds" side="right" inset={200} start={8} exit={dur(scenes.s8) - 8} />
    </AbsoluteFill>
  );
};
