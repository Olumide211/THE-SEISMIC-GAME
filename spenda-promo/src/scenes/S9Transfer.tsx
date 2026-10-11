import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { ScreenPush } from "../components/ScreenPush";
import { Ripple } from "../components/Ripple";
import { HomeScreen } from "../screens/HomeScreen";
import { NotificationBanner } from "../screens/NotificationBanner";
import { SEND_BTN, TransferScreen, TransferSentSheet } from "../screens/TransferScreen";
import { bannerState, homeState, transferState } from "./phoneState";
import { prog } from "../anim";
import { dur, scenes, t } from "../timeline";

export const S9Transfer: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s9.from;
  const s = transferState(abs);
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <>
            <ScreenPush
              abs={abs}
              at={t.toTransfer}
              from={<HomeScreen {...homeState(abs)} />}
              to={<TransferScreen amount={s.amount} caret={s.caret} pressed={s.pressed} loading={s.loading} />}
            />
            <NotificationBanner progress={bannerState(abs)} />
            <Ripple p={prog(abs, t.tapSend, t.tapSend + 14, (x) => x)} x={195} y={SEND_BTN.top + SEND_BTN.h / 2} size={80} color="#9A9AA0" />
            <TransferSentSheet progress={s.sheet} pop={s.pop} draw={s.draw} />
          </>
        }
      />
      <StepLabel line1="Spend it" line2="anywhere" side="left" inset={240} start={8} exit={dur(scenes.s9) - 8} />
    </AbsoluteFill>
  );
};
