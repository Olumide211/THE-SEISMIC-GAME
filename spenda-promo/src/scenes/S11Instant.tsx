import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand, toAmount } from "../brand";
import { FONT } from "../font";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { StepLabel } from "../components/StepLabel";
import { SuccessScreen } from "../screens/SuccessScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { chatScript } from "./S2Chat";
import { EXPO, prog, revealStyle, sp } from "../anim";
import { dur, scenes, t } from "../timeline";

const SplitHalf: React.FC<{ side: "left" | "right"; p: number; children: React.ReactNode; style: React.CSSProperties }> = ({
  side,
  p,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      [side]: 0,
      width: "50%",
      overflow: "hidden",
      clipPath: side === "left" ? `inset(0 0 0 ${(1 - p) * 100}%)` : `inset(0 ${(1 - p) * 100}% 0 0)`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const S11Instant: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s11.from;
  const split = prog(abs, t.split11, t.split11 + 9, EXPO);
  const head = prog(abs, t.split11 + 4, t.split11 + 14, EXPO);
  const pop = sp(abs, t.success, { damping: 9, stiffness: 220, mass: 0.6 });
  const oldChat = chatScript.map((m) => ({ ...m, progress: 1 }));

  return (
    <AbsoluteFill>
      {/* split comparison behind the phone */}
      <SplitHalf side="left" p={split} style={{ background: "#E6E6E6", filter: "grayscale(1)" }}>
        <div style={{ position: "absolute", top: 120, left: 110, fontFamily: FONT, fontWeight: 600, fontSize: 54, color: "#555", letterSpacing: "-0.02em", ...revealStyle(head) }}>
          P2P: 40 mins ⏳
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
          <Phone screen={<ChatScreen messages={oldChat} typing={false} />} scale={0.62} rotateZ={-6} rotateY={10} x={-170} y={160} />
        </div>
      </SplitHalf>
      <SplitHalf side="right" p={split} style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F2EEFF 60%, #EAFBD0 100%)" }}>
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 110,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 54,
            color: brand.colors.primary,
            letterSpacing: "-0.02em",
            ...revealStyle(head),
          }}
        >
          Spenda: 3 secs ⚡
        </div>
      </SplitHalf>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, marginLeft: -1, background: "rgba(0,0,0,0.08)", opacity: split }} />

      <Phone
        {...phonePose(abs)}
        screen={
          <SuccessScreen
            toAmount={toAmount}
            pop={Math.max(0, pop)}
            draw={prog(abs, t.success + 3, t.success + 12)}
            textIn={prog(abs, t.success + 5, t.success + 14)}
          />
        }
      />
      <StepLabel line1="Just" line2="instant." side="right" inset={150} y={150} start={6} exit={dur(scenes.s11) - 6} />
    </AbsoluteFill>
  );
};
