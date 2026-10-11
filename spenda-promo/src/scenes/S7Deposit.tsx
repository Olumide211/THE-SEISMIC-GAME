import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { ScreenPush } from "../components/ScreenPush";
import { RatesScreen } from "../screens/RatesScreen";
import { DepositCryptoScreen } from "../screens/DepositCryptoScreen";
import { depositState, ratesState } from "./phoneState";
import { dur, scenes, t } from "../timeline";

export const S7Deposit: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s7.from;
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={<ScreenPush abs={abs} at={t.toDeposit} from={<RatesScreen {...ratesState(abs)} />} to={<DepositCryptoScreen {...depositState(abs)} />} />}
      />
      <StepLabel line1="Send your" line2={brand.coin} side="left" inset={240} start={8} exit={dur(scenes.s7) - 8} />
    </AbsoluteFill>
  );
};
