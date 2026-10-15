import React from "react";
import { AbsoluteFill, random } from "remotion";
import { brand } from "../brand";
import { FPS, T } from "../timeline";
import { FONT } from "../components/fonts";
import { Glow, Grain } from "../components/Glow";
import { Lockup } from "../components/Logo";
import { easeOut, mix, pop, ramp, useSceneTime } from "../components/motion";

const S = T.s8;
const C = brand.colors;
const SLICES = 9;
const SHARDS = { cols: 7, rows: 4 };
const P2P_BOX = { w: 520, h: 200 };

const P2P: React.FC = () => (
  <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 190, letterSpacing: "-0.04em", color: "#3A3A3A", lineHeight: 1 }}>
    {brand.copy.oldWay}
  </span>
);

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", ...style }}>{children}</AbsoluteFill>
);

export const S8Outro: React.FC = () => {
  // Hold perfectly still for the final 10 frames.
  const t = Math.min(useSceneTime(S.start), S.freeze);
  const frame = Math.floor(t * FPS);

  const g = ramp(t, [S.glitch[0], S.glitch[1]], (n) => n);
  const glitching = t >= S.glitch[0] && t < S.glitch[1];
  const shattering = t >= S.shatter[0] && t < S.shatter[1];
  const sh = ramp(t, [S.shatter[0], S.shatter[1]], easeOut);
  const logo = pop(t, S.logoIn[0], { damping: 14, stiffness: 160 });
  const logoIn = ramp(t, [S.logoIn[0], S.logoIn[1]]);
  const glint = ramp(t, [S.glint[0], S.glint[1]], (n) => n);
  const gx = mix(-20, 120, glint);
  const tag = ramp(t, [S.tagline, S.tagline + 0.45]);

  const credit = brand.credit;
  const typed = Math.floor(ramp(t, [S.creditType[0], S.creditType[1]], (n) => n) * credit.length);
  const caretBlink = Math.floor((t - S.creditType[0]) / 0.25) % 2 === 0 ? 1 : 0;
  const caret = t < S.creditType[0] ? 0 : caretBlink * (1 - ramp(t, [S.caretOut[0], S.caretOut[1]]));

  const split = 14 * Math.sin(g * Math.PI);
  const band = 100 / SLICES;

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Glow t={t} strength={mix(0.2, 0.9, logoIn)} size={1300} />

      {/* P2P, still then glitching */}
      {t < S.glitch[0] && (
        <Center>
          <P2P />
        </Center>
      )}
      {glitching &&
        new Array(SLICES).fill(0).map((_, i) => (
          <Center
            key={i}
            style={{
              clipPath: `inset(${(i * band).toFixed(2)}% -20% ${(100 - (i + 1) * band).toFixed(2)}% -20%)`,
              translate: `${(random(`gx${i}-${frame}`) - 0.5) * 160 * Math.sin(g * Math.PI)}px 0`,
              filter: `drop-shadow(${-split}px 0 0 rgba(255,0,72,0.85)) drop-shadow(${split}px 0 0 rgba(0,220,255,0.75))`,
            }}
          >
            <P2P />
          </Center>
        ))}

      {/* P2P shattering into shards */}
      {shattering &&
        new Array(SHARDS.cols * SHARDS.rows).fill(0).map((_, i) => {
          const col = i % SHARDS.cols;
          const row = Math.floor(i / SHARDS.cols);
          const x0 = (col / SHARDS.cols) * 100;
          const y0 = (row / SHARDS.rows) * 100;
          const dx = (col - SHARDS.cols / 2 + 0.5) * 140 + (random(`sx${i}`) - 0.5) * 200;
          const dy = (row - SHARDS.rows / 2 + 0.5) * 160 + (random(`sy${i}`) - 0.5) * 200;
          return (
            <Center
              key={i}
              style={{
                clipPath: `inset(calc(50% - ${P2P_BOX.h / 2}px + ${(y0 * P2P_BOX.h) / 100}px) calc(50% + ${P2P_BOX.w / 2}px - ${((x0 + 100 / SHARDS.cols) * P2P_BOX.w) / 100}px) calc(50% + ${P2P_BOX.h / 2}px - ${((y0 + 100 / SHARDS.rows) * P2P_BOX.h) / 100}px) calc(50% - ${P2P_BOX.w / 2}px + ${(x0 * P2P_BOX.w) / 100}px))`,
                translate: `${dx * sh}px ${dy * sh}px`,
                rotate: `${(random(`sr${i}`) - 0.5) * 120 * sh}deg`,
                opacity: 1 - sh,
                filter: `blur(${sh * 6}px)`,
              }}
            >
              <P2P />
            </Center>
          );
        })}

      {/* Spenda lockup */}
      {t >= S.logoIn[0] && (
        <Center
          style={{
            scale: String(mix(1.18, 1, logo)),
            opacity: logoIn,
            filter: `blur(${mix(14, 0, logoIn)}px)`,
            translate: `0 ${mix(0, -46, tag)}px`,
          }}
        >
          <Lockup size={170} color="#EDEDED" />
        </Center>
      )}
      {glint > 0 && glint < 1 && (
        <Center
          style={{
            translate: `0 ${mix(0, -46, tag)}px`,
            WebkitMaskImage: `linear-gradient(105deg, transparent ${gx - 10}%, black ${gx}%, transparent ${gx + 10}%)`,
            maskImage: `linear-gradient(105deg, transparent ${gx - 10}%, black ${gx}%, transparent ${gx + 10}%)`,
            filter: "drop-shadow(0 0 16px rgba(255,255,255,0.9))",
          }}
        >
          <Lockup size={170} color={C.white} />
        </Center>
      )}

      {/* Tagline */}
      <Center>
        <div
          style={{
            marginTop: 250,
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 48,
            letterSpacing: "-0.02em",
            color: "#BDBDBD",
            opacity: tag,
            translate: `0 ${mix(14, 0, tag)}px`,
            filter: `blur(${mix(8, 0, tag)}px)`,
          }}
        >
          {brand.copy.tagline}
        </div>
      </Center>

      {/* Credit, typed in bottom-right */}
      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 52,
          fontFamily: FONT,
          fontSize: 22,
          color: C.muted,
          display: "flex",
          alignItems: "center",
          whiteSpace: "pre",
        }}
      >
        {credit.slice(0, typed)}
        <span style={{ width: 2, height: 26, marginLeft: 3, background: C.muted, opacity: caret }} />
        {/* Untyped characters hold the final width so text grows left to right */}
        <span style={{ opacity: 0 }}>{credit.slice(typed)}</span>
      </div>
      <Grain t={t} />
    </AbsoluteFill>
  );
};
