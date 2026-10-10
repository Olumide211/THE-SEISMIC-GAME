import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { DoodleBg } from "../components/DoodleBg";
import { AppIcon } from "../components/AppIcon";
import { EXPO, prog, sp } from "../anim";
import { t, scenes } from "../timeline";

const GAP = 220;

export const S5Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s5.from;

  const meet = Array.from("Meet");
  const spendaColor = interpolateColors(abs, [t.spenda, t.spenda + 12], ["#CCCCCC", brand.colors.textDark]);
  const spendaIn = prog(abs, t.spenda, t.spenda + 10, EXPO);
  const two = sp(abs, t.twoPoint, { damping: 8, stiffness: 260, mass: 0.6 });
  const split = sp(abs, t.split, { damping: 14, stiffness: 140 });

  const draw = prog(abs, t.iconDraw, t.iconFill);
  const fill = prog(abs, t.iconFill, t.iconFill + 6);
  const bounce = sp(abs, t.iconFill, { damping: 7, stiffness: 220, mass: 0.6 });
  const iconScale = abs < t.iconFill ? 0.9 : 0.9 + 0.1 * bounce;
  const iconOpacity = prog(abs, t.iconDraw, t.iconDraw + 3);

  return (
    <AbsoluteFill style={{ background: brand.colors.lightBg, alignItems: "center", justifyContent: "center" }}>
      <DoodleBg opacity={0.04} />
      <div style={{ display: "flex", alignItems: "center", fontFamily: FONT, fontWeight: 600, fontSize: 110, letterSpacing: "-0.035em", color: brand.colors.textDark }}>
        <div style={{ display: "flex" }}>
          {meet.map((c, i) => {
            const s = sp(abs, t.meet + i * 2, { damping: 8, stiffness: 240, mass: 0.6 });
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  transform: `translateY(${(1 - s) * 60}px) scale(${Math.max(0, s)})`,
                  opacity: Math.min(1, s * 2),
                  transformOrigin: "50% 80%",
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
        {/* the gap opens up and the app icon draws on inside it */}
        <div style={{ width: 30 + (GAP - 30) * split, height: 10, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) scale(${iconScale})`,
              opacity: iconOpacity,
            }}
          >
            <AppIcon size={150} draw={draw} fill={fill} id="s5icon" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              color: spendaColor,
              opacity: spendaIn,
              filter: spendaIn < 1 ? `blur(${(1 - spendaIn) * 8}px)` : undefined,
              transform: `translateY(${(1 - spendaIn) * 12}px)`,
              display: "inline-block",
            }}
          >
            {brand.name}
          </span>
          <span
            style={{
              display: "inline-block",
              marginLeft: 22,
              padding: "0 20px",
              borderRadius: 28,
              background: brand.colors.accent,
              color: brand.colors.textDark,
              fontWeight: 700,
              transform: `scale(${Math.max(0, two)}) rotate(${(1 - Math.min(1, two)) * -10}deg)`,
              opacity: Math.min(1, Math.max(0, two) * 2),
              lineHeight: 1.15,
            }}
          >
            {brand.version}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
