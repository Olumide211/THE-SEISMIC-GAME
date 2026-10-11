import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { Phone } from "../components/Phone";
import { phonePose } from "../components/camera";
import { ChatScreen } from "../screens/ChatScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { TransferSentSheet } from "../screens/TransferScreen";
import { chatScript } from "./S2Chat";
import { homeState, transferState } from "./phoneState";
import { EXPO, prog, revealStyle } from "../anim";
import { scenes, t } from "../timeline";

const Half: React.FC<{ side: "left" | "right"; p: number; children: React.ReactNode; style: React.CSSProperties }> = ({ side, p, children, style }) => (
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

const Caption: React.FC<{ small: string; big: string; color: string; align: "left" | "right"; p: number }> = ({ small, big, color, align, p }) => (
  <div style={{ position: "absolute", top: 110, [align]: 110, textAlign: align, fontFamily: FONT, ...revealStyle(p) }}>
    <div style={{ fontSize: 30, color: brand.colors.muted }}>{small}</div>
    <div style={{ fontSize: 76, fontWeight: 600, color, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{big}</div>
  </div>
);

/** Same job, side by side: P2P vendor (grey, 40 mins) vs Spenda (seconds). */
export const S10Versus: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s10.from;
  const split = prog(abs, t.versus, t.versus + 9, EXPO);
  const cap = prog(abs, t.versus + 4, t.versus + 14, EXPO);
  const s = transferState(abs);
  return (
    <AbsoluteFill>
      <Half side="left" p={split} style={{ background: "#E4E4E4", filter: "grayscale(1)" }}>
        <Caption small="P2P vendor" big="40 mins ⏳" color="#5A5A5E" align="left" p={cap} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.85 }}>
          <Phone screen={<ChatScreen messages={chatScript.map((m) => ({ ...m, progress: 1 }))} typing={false} status="last seen today at 20:15" />} scale={0.6} rotateZ={-6} rotateY={10} x={-160} y={190} />
        </div>
      </Half>
      <Half side="right" p={split} style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F1F8EC 100%)" }}>
        <Caption small="Spenda" big="Seconds ⚡" color={brand.colors.ink} align="right" p={cap} />
      </Half>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, marginLeft: -1, background: "rgba(0,0,0,0.08)", opacity: split }} />
      <Phone
        {...phonePose(abs)}
        screen={
          <>
            <HomeScreen {...homeState(abs)} />
            <TransferSentSheet progress={s.sheet} pop={s.pop} draw={1} />
          </>
        }
      />
    </AbsoluteFill>
  );
};
