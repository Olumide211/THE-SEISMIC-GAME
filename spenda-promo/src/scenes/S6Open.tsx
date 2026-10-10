import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { SplashScreen } from "../screens/SplashScreen";
import { SpendaHome } from "../screens/SpendaHome";
import { homeState } from "./phoneState";
import { prog, sp } from "../anim";
import { dur, scenes, t } from "../timeline";

export const S6Open: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s6.from;
  const enter = sp(abs, scenes.s6.from, { damping: 16, stiffness: 150 });
  const homeFade = prog(abs, t.homeIn - 3, t.homeIn + 1);
  const pose = phonePose(abs);
  return (
    <AbsoluteFill>
      <Phone
        {...pose}
        y={(pose.y ?? 0) + (1 - enter) * 120}
        opacity={Math.min(1, enter * 1.6)}
        screen={
          <>
            <SpendaHome {...homeState(abs)} />
            {homeFade < 1 ? (
              <AbsoluteFill style={{ opacity: 1 - homeFade }}>
                <SplashScreen t={abs - t.splash} />
              </AbsoluteFill>
            ) : null}
          </>
        }
      />
      <StepLabel line1="Open" line2="Spenda" side="left" inset={260} start={3} exit={dur(scenes.s6) - 8} />
    </AbsoluteFill>
  );
};
