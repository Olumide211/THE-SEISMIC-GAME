import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { ScreenPush } from "../components/ScreenPush";
import { HomeScreen } from "../screens/HomeScreen";
import { RatesScreen } from "../screens/RatesScreen";
import { homeState, ratesState } from "./phoneState";
import { dur, scenes, t } from "../timeline";

export const S6Rates: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s6.from;
  const r = ratesState(abs);
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={<ScreenPush abs={abs} at={t.toRates} from={<HomeScreen {...homeState(abs)} />} to={<RatesScreen {...r} />} />}
      />
      <StepLabel line1="Check the" line2="live rate" side="right" inset={200} start={8} exit={dur(scenes.s6) - 8} />
    </AbsoluteFill>
  );
};
