import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { GlossyCheck } from "../components/GlossyCheck";
import { Confetti } from "../components/Confetti";
import { prog, revealAt, sp } from "../anim";
import { scenes, t } from "../timeline";

export const CHECK_SIZE = 260;
export const CHECK_Y = 400; // centre of the orb

/** Static-able layout shared with S13 (which scales/blurs it away). */
export const DoneCard: React.FC<{ abs: number }> = ({ abs }) => {
  const pop = sp(abs, t.checkPop, { damping: 8, stiffness: 200, mass: 0.7 });
  const local = abs - scenes.s12.from;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: "50%", top: CHECK_Y, transform: `translate(-50%, -50%) scale(${Math.max(0, pop)})` }}>
        <GlossyCheck size={CHECK_SIZE} draw={prog(abs, t.checkDraw, t.checkDraw + 12)} />
      </div>
      <div style={{ position: "absolute", top: CHECK_Y + CHECK_SIZE / 2 + 70, left: 0, right: 0, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 40, fontWeight: 700, color: brand.colors.textDark, letterSpacing: "-0.02em", ...revealAt(local, 8) }}>
          Done in seconds
        </div>
        <div style={{ fontSize: 24, color: brand.colors.textMuted, marginTop: 12, ...revealAt(local, 12) }}>
          Naira in. Stablecoins out.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const S12Done: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s12.from;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <DoneCard abs={abs} />
      <Confetti start={t.confetti - scenes.s12.from} x={960} y={CHECK_Y} count={30} />
    </AbsoluteFill>
  );
};
