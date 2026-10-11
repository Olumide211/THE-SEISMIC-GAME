import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { Confetti } from "../components/Confetti";
import { SuccessRing } from "../screens/TransferScreen";
import { EXPO, prog, revealStyle, sp } from "../anim";
import { scenes, t } from "../timeline";

const RING = 190;
const RING_Y = 300;
const ARC: [number, number] = [Math.PI * 0.95, Math.PI * 2.05]; // upper half only, clear of the text
const LINES = ["No vendor.", "No screenshots.", "No wahala."];

export const S11NoWahala: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s11.from;
  const pop = sp(abs, t.checkPop, { damping: 8, stiffness: 200, mass: 0.7 });
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <Confetti start={t.confetti - scenes.s11.from} x={960} y={RING_Y} count={30} arc={ARC} />
      <div style={{ position: "absolute", left: "50%", top: RING_Y, transform: `translate(-50%, -50%) scale(${Math.max(0, pop)})` }}>
        <SuccessRing size={RING} draw={prog(abs, t.checkPop + 3, t.checkPop + 13)} />
      </div>
      <div style={{ position: "absolute", top: RING_Y + RING / 2 + 50, left: 0, right: 0, textAlign: "center", fontFamily: FONT }}>
        {LINES.map((l, i) => {
          const at = t.checkPop + 6 + i * 6;
          const last = i === LINES.length - 1;
          return (
            <div
              key={l}
              style={{
                fontSize: 70,
                fontWeight: last ? 600 : 400,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: last ? brand.colors.ink : "#9A9AA0",
                ...revealStyle(prog(abs, at, at + 12, EXPO)),
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
