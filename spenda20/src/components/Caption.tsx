import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";
import { RevealWords } from "./KineticText";
import { ramp } from "./motion";

// Per-feature caption beside the phone. Fades out before the next feature.
export const Caption: React.FC<{
  text: string;
  t: number;
  start: number;
  end: number;
  side: "left" | "right";
}> = ({ text, t, start, end, side }) => {
  const out = 1 - ramp(t, [end - 0.22, end]);
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 720,
        [side]: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        opacity: out,
      }}
    >
      <RevealWords
        text={text}
        t={t}
        start={start}
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 84,
          lineHeight: 1.04,
          letterSpacing: "-0.04em",
          color: brand.colors.white,
          alignItems: side === "left" ? "flex-start" : "flex-end",
          justifyContent: side === "left" ? "flex-start" : "flex-end",
          textAlign: side,
        }}
      />
    </div>
  );
};
