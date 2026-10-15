import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { brand } from "../brand";
import { T } from "../timeline";
import { useDirBlur } from "../components/DirBlur";
import { FONT } from "../components/fonts";
import { Glow, Grain } from "../components/Glow";
import { SpendaLogo } from "../components/Logo";
import { blurFromSpeed, clamp, easeIn, easeOut, mix, pop, ramp, speed, useSceneTime } from "../components/motion";

const S = T.s3;
const C = brand.colors;

export const LOGO_W = 150;
// How far the logo slides left to make room for the wordmark (keeps the lockup centered).
export const LOCKUP_SHIFT = 440;
const WORD_SIZE = 170;

const sphereY = (t: number) => interpolate(t, [S.sphere[0], S.sphere[1]], [700, 0], { ...clamp, easing: easeOut });

// The lockup row: logo + "Spenda" + "2.0". `glint` draws a pure-white copy for the sweep.
const LockupRow: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const shift = mix(0, -LOCKUP_SHIFT, ramp(t, [S.slideLeft[0], S.slideLeft[1]]));
  const wipe = ramp(t, [S.wordWipe[0], S.wordWipe[1]]);
  const v = pop(t, S.version, { damping: 12, stiffness: 220 });
  const draw = ramp(t, [S.draw[0], S.draw[1]]);
  const fill = ramp(t, [S.fill[0], S.fill[1]]);
  const unfold = pop(t, S.unfold[0], { damping: 13, stiffness: 160 });
  const popScale = t >= S.pop ? 1 + 0.14 * Math.sin(Math.min(1, (t - S.pop) / 0.22) * Math.PI) : 1;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 960 - LOGO_W / 2 + shift,
          top: 540 - (LOGO_W * 1.34) / 2,
          scale: String(popScale),
          zIndex: 2,
        }}
      >
        <SpendaLogo size={LOGO_W} color={color} draw={draw} fill={fill} unfold={unfold} />
      </div>
      {/* Wordmark wipes out from behind the logo */}
      <div
        style={{
          position: "absolute",
          left: 960 + LOGO_W / 2 + shift + 46,
          top: 540 - WORD_SIZE * 0.56,
          display: "flex",
          alignItems: "baseline",
          gap: 34,
          clipPath: `inset(-30% ${mix(100, -5, wipe)}% -30% 0)`,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: WORD_SIZE,
            letterSpacing: "-0.045em",
            color,
            lineHeight: 1,
            display: "inline-block",
            translate: `${mix(-160, 0, wipe)}px 0`,
          }}
        >
          {brand.name}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: WORD_SIZE,
            letterSpacing: "-0.04em",
            color: color === C.white ? "#7A7A7A" : color,
            lineHeight: 1,
            display: "inline-block",
            opacity: Math.min(1, v * 2),
            scale: String(mix(0.4, 1, v)),
            transformOrigin: "0 80%",
          }}
        >
          {brand.version}
        </span>
      </div>
    </>
  );
};

export const S3Reveal: React.FC = () => {
  const t = useSceneTime(S.start);

  const sy = sphereY(t);
  const blur = useDirBlur(0, blurFromSpeed(speed(sphereY, t), 0.35));
  const stretch = 1 + Math.min(1, speed(sphereY, t) / 60);
  const sphereOut = ramp(t, [S.draw[0] + 0.04, S.fill[1]], easeIn);
  const sphereSize = mix(130, 60, sphereOut);

  const glint = ramp(t, [S.glint[0], S.glint[1]], (n) => n);
  const gx = mix(-30, 130, glint);

  return (
    <AbsoluteFill style={{ background: C.black }}>
      <Glow t={t} strength={mix(0.3, 1, ramp(t, [S.pop, S.pop + 0.3]))} />

      {/* Glowing sphere */}
      <div
        style={{
          position: "absolute",
          left: 960 - sphereSize / 2,
          top: 540 - sphereSize / 2 + sy,
          width: sphereSize,
          height: sphereSize,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff 0%, #fff 36%, rgba(255,255,255,0.5) 58%, transparent 72%)",
          boxShadow: `0 0 90px 30px rgba(255,255,255,${mix(0.45, 0, sphereOut)})`,
          scale: `${1 / Math.sqrt(stretch)} ${stretch}`,
          opacity: 1 - sphereOut,
          filter: `${blur.filter === "none" ? "" : blur.filter} blur(${mix(16, 4, sphereOut)}px)`.trim(),
        }}
      >
        {blur.defs}
      </div>

      <LockupRow t={t} color="#EDEDED" />

      {/* Light glint: a pure-white copy revealed through a moving band */}
      {glint > 0 && glint < 1 && (
        <AbsoluteFill
          style={{
            WebkitMaskImage: `linear-gradient(105deg, transparent ${gx - 12}%, black ${gx}%, transparent ${gx + 12}%)`,
            maskImage: `linear-gradient(105deg, transparent ${gx - 12}%, black ${gx}%, transparent ${gx + 12}%)`,
            filter: "drop-shadow(0 0 18px rgba(255,255,255,0.9))",
          }}
        >
          <LockupRow t={t} color={C.white} />
        </AbsoluteFill>
      )}
      <Grain t={t} />
    </AbsoluteFill>
  );
};
