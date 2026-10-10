import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { Typewriter } from "../components/Typewriter";
import { t, scenes } from "../timeline";

export const S1Dear: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.1 + 0.12 * (0.5 - 0.5 * Math.cos((frame / 22) * Math.PI * 2));
  return (
    <AbsoluteFill style={{ background: brand.colors.darkBg, alignItems: "center", justifyContent: "center" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(229,72,77,${pulse}) 100%)`,
        }}
      />
      <Typewriter
        text="Dear P2P vendor,"
        start={t.dearType - scenes.s1.from}
        framesPerChar={1.4}
        caret="#fff"
        style={{ fontFamily: FONT, fontWeight: 600, fontSize: 72, color: "#fff", letterSpacing: "-0.02em" }}
      />
    </AbsoluteFill>
  );
};
