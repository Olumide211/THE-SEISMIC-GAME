import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { Words } from "../components/Words";
import { t, scenes } from "../timeline";

export const S3Waiting: React.FC = () => {
  const frame = useCurrentFrame();
  const settleFrom = t.waiting - scenes.s3.from + 8;
  const red = interpolateColors(frame, [settleFrom, settleFrom + 10], [brand.colors.danger, "#8A8A8E"]);
  return (
    <AbsoluteFill style={{ background: "#fff", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 500, color: "#8A8A8E", display: "flex", gap: "0.5em", letterSpacing: "-0.01em" }}>
        <Words words={["It's", "not", "you."]} start={t.notYou - scenes.s3.from} stagger={2} />
        <Words
          words={["It's", "the", "waiting."]}
          start={t.waiting - scenes.s3.from}
          stagger={2}
          wordStyle={(i) => (i === 2 ? { color: red, fontWeight: 600 } : {})}
        />
      </div>
    </AbsoluteFill>
  );
};
