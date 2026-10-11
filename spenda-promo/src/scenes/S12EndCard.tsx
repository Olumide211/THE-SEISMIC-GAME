import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { SplashScreen } from "../screens/SplashScreen";
import { prog, revealAt } from "../anim";
import { scenes, t } from "../timeline";

/** Bookend: the app's own launch animation, big, with the tagline. */
export const S12EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s12.from;
  const fade = prog(abs, t.fadeOut, t.fadeOut + 12, (x) => x);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: "translateY(-40px)" }}>
        <SplashScreen t={abs - t.endSplash} k={4.2} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, marginTop: 110, textAlign: "center", fontFamily: FONT, fontSize: 44, color: "#BDBDC2", ...revealAt(abs, t.tagline, 14) }}>
        {brand.tagline}
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: fade }} />
    </AbsoluteFill>
  );
};
