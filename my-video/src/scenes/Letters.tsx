import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { brand } from "../brand";
import { T } from "../timeline";
import { FONT } from "../components/fonts";
import { SpendaMark } from "../components/Logo";
import { clamp, easeInOut, easeOut, mix, pop, ramp, useSceneTime } from "../components/motion";

const L = T.letters;
const LETTERS = brand.name.toLowerCase().split("");
export const ICON_SIZE = 200;

export const Letters: React.FC = () => {
  const t = useSceneTime(L.start);

  // 1. Swoosh streak
  const streakP = ramp(t, [L.streak[0], L.streak[1]], easeInOut);
  const streakVisible = t < L.streak[1] + 0.02;

  // 2. Single letters flashing in the center
  const flashIndex = Math.floor((t - L.flashStart) / L.flashStep);
  const flashing = t >= L.flashStart && flashIndex >= 0 && flashIndex < LETTERS.length && t < L.assemble;
  const flashLocal = flashing ? (t - L.flashStart - flashIndex * L.flashStep) / L.flashStep : 0;

  // 3. Word assembles letter by letter
  const assembled = t >= L.assemble;

  // 4. Morph into the app icon
  const m = ramp(t, [L.iconMorph[0], L.iconMorph[1]], easeInOut);
  const boxW = mix(470, ICON_SIZE, m);
  const boxH = mix(150, ICON_SIZE, m);
  const boxR = mix(75, ICON_SIZE * 0.24, m);
  const boxIn = ramp(t, [L.iconMorph[0] - 0.04, L.iconMorph[0] + 0.06]);
  const wordOut = ramp(t, [L.iconMorph[0] + 0.02, L.iconMorph[0] + 0.12]);
  const markIn = ramp(t, [L.iconMorph[0] + 0.08, L.iconMorph[1]]);

  // 5. Background snaps white, icon pops bigger
  const white = t >= L.bgSnap;
  const iconPop = white ? mix(0.62, 1, pop(t, L.iconPop, { damping: 11 })) : 1;
  const preSnapScale = interpolate(t, [L.iconMorph[1], L.bgSnap], [1, 0.62], { ...clamp, easing: easeOut });

  return (
    <AbsoluteFill
      style={{
        background: white ? brand.colors.canvas : brand.colors.black,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {streakVisible && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path
            d="M 330 640 Q 640 470 960 540"
            fill="none"
            stroke="white"
            strokeWidth={7}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray="0.35 1"
            strokeDashoffset={mix(0.35, -1, streakP)}
            style={{ filter: "blur(1.5px)" }}
          />
        </svg>
      )}

      {flashing && (
        <span
          style={{
            position: "absolute",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: mix(130, 104, flashLocal),
            color: brand.colors.white,
            lineHeight: 1,
            translate: `${(random(`fx${flashIndex}`) - 0.5) * 40}px ${(random(`fy${flashIndex}`) - 0.5) * 20}px`,
            opacity: interpolate(flashLocal, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.6]),
            filter: `blur(${mix(4, 0, Math.min(1, flashLocal * 3))}px)`,
          }}
        >
          {LETTERS[flashIndex]}
        </span>
      )}

      {assembled && (
        <div
          style={{
            position: "relative",
            width: boxW,
            height: boxH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(white ? iconPop : preSnapScale),
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: boxR,
              background: brand.colors.brand,
              opacity: boxIn,
              boxShadow: white ? "0 30px 60px rgba(26,58,92,0.25), 0 8px 18px rgba(0,0,0,0.12)" : "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 104,
              letterSpacing: "-0.03em",
              color: brand.colors.white,
              opacity: 1 - wordOut,
              scale: String(mix(1, 0.55, wordOut)),
              filter: `blur(${mix(0, 10, wordOut)}px)`,
              lineHeight: 1,
              marginTop: -8,
            }}
          >
            {LETTERS.map((ch, i) => {
              const p = ramp(t, [L.assemble + i * L.assembleStagger, L.assemble + i * L.assembleStagger + 0.08]);
              return (
                <span
                  key={i}
                  style={{
                    opacity: p,
                    display: "inline-block",
                    scale: String(mix(1.5, 1, p)),
                    filter: `blur(${mix(8, 0, p)}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <div
            style={{
              position: "absolute",
              opacity: markIn,
              scale: String(mix(1.4, 1, markIn)),
            }}
          >
            <SpendaMark size={ICON_SIZE} bg="transparent" />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
