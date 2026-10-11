import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { SplashScreen } from "../screens/SplashScreen";
import { PinScreen } from "../screens/PinScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { homeState } from "./phoneState";
import { prog } from "../anim";
import { dur, scenes, t } from "../timeline";

const PIN_KEYS = [0, 4, 8, 10]; // which keypad cell flashes per digit

/** The real Spenda launch animation, full-bleed, then the pull-back reveal. */
export const S5Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s5.from;
  const pinFade = prog(abs, t.toPin, t.toPin + 6);
  const digit = Math.floor((abs - t.pinDots) / 3);
  const filled = Math.max(0, Math.min(4, digit + 1));
  const homeFade = prog(abs, t.homeIn - 3, t.homeIn + 2);
  return (
    <AbsoluteFill>
      <Phone
        {...phonePose(abs)}
        screen={
          <>
            {homeFade > 0 ? <HomeScreen {...homeState(abs)} /> : null}
            {homeFade < 1 ? (
              <AbsoluteFill style={{ opacity: 1 - homeFade }}>
                <PinScreen filled={abs >= t.pinDots ? filled : 0} pressedKey={abs >= t.pinDots && digit < 4 ? PIN_KEYS[digit] : null} />
              </AbsoluteFill>
            ) : null}
            {pinFade < 1 ? (
              <AbsoluteFill style={{ opacity: 1 - pinFade }}>
                <SplashScreen t={abs - t.splash} />
              </AbsoluteFill>
            ) : null}
          </>
        }
      />
      <StepLabel line1="Open" line2="Spenda" side="left" inset={240} start={t.pinDots - scenes.s5.from} exit={dur(scenes.s5) - 8} />
    </AbsoluteFill>
  );
};
