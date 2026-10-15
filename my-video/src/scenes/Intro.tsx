import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { brand } from "../brand";
import { T } from "../timeline";
import { useDirBlur } from "../components/DirBlur";
import { FONT } from "../components/fonts";
import { CheckBadge } from "../components/Icons";
import {
  blurFromSpeed,
  clamp,
  easeIn,
  easeOut,
  mix,
  pop,
  ramp,
  speed,
  useSceneTime,
} from "../components/motion";

const I = T.intro;
const ICON = 64;

// Sphere offset (relative to the check icon) as it flies up from bottom center.
const sphereX = (t: number) =>
  interpolate(t, [I.sphereIn[0], I.sphereIn[1]], [-150, 0], { ...clamp, easing: easeOut });
const sphereY = (t: number) =>
  interpolate(t, [I.sphereIn[0], I.sphereIn[1]], [720, 0], { ...clamp, easing: easeOut });

// Small blurred accent sphere zipping across, like the reference's flying dots.
const accentX = (t: number) =>
  interpolate(t, [I.accentStreak[0], I.accentStreak[1]], [700, 1250], { ...clamp, easing: easeOut });

const trailY = (t: number) =>
  interpolate(t, [I.trailSphere[0], I.trailSphere[1]], [1120, 640], { ...clamp, easing: easeOut });

export const Intro: React.FC = () => {
  const t = useSceneTime(I.start);
  const trail = useDirBlur(0, blurFromSpeed(speed(trailY, t), 0.3));

  const vy = speed(sphereY, t);
  const vx = speed(sphereX, t);
  const morph = ramp(t, [I.sphereIn[1] - 0.06, I.wordIn[1]]);
  const sphereSize = mix(118, ICON, morph);
  const sphereBlur = mix(20, 0, morph);
  const stretch = 1 + Math.min(0.9, vy / 70);
  const sphere = useDirBlur(blurFromSpeed(vx, 0.25), blurFromSpeed(vy, 0.3));

  const word = ramp(t, [I.wordIn[0], I.wordIn[1]]);
  const wordShift = mix(70, 0, pop(t, I.wordIn[0], { damping: 14 }));
  const check = ramp(t, [I.checkDraw[0], I.checkDraw[1]]);

  const out = ramp(t, [I.dotOut[0], I.dotOut[1]], easeIn);
  const groupScale = mix(1, 0.015, out);
  const textFade = 1 - ramp(t, [I.dotOut[0], I.dotOut[0] + 0.1]);
  const vanish = 1 - ramp(t, [I.dotOut[1] - 0.02, I.end], easeIn);

  const ax = accentX(t);
  const accent = useDirBlur(blurFromSpeed(speed(accentX, t), 0.45, 30), 0);

  return (
    <AbsoluteFill style={{ background: brand.colors.black }}>
      {/* Accent streak */}
      <div
        style={{
          position: "absolute",
          left: ax,
          top: interpolate(t, [I.accentStreak[0], I.accentStreak[1]], [210, 150], clamp),
          width: 46,
          height: 46,
          borderRadius: 23,
          background: "radial-gradient(circle, #fff 0%, rgba(255,255,255,0.6) 45%, transparent 72%)",
          opacity: interpolate(t, [I.accentStreak[0], I.accentStreak[0] + 0.04, I.accentStreak[1] - 0.06, I.accentStreak[1]], [0, 0.9, 0.7, 0], clamp),
          filter: accent.filter,
        }}
      >
        {accent.defs}
      </div>

      {/* Trailing sphere rising beneath the word */}
      <div
        style={{
          position: "absolute",
          left: 960 - 22,
          top: trailY(t),
          width: 44,
          height: 44,
          borderRadius: 22,
          background: "radial-gradient(circle, #fff 0%, #fff 40%, rgba(255,255,255,0.4) 62%, transparent 72%)",
          scale: `1 ${1 + Math.min(0.8, speed(trailY, t) / 40)}`,
          opacity: interpolate(t, [I.trailSphere[0], I.trailSphere[0] + 0.05, I.trailSphere[1] - 0.08, I.trailSphere[1]], [0, 1, 1, 0], clamp),
          filter: trail.filter,
        }}
      >
        {trail.defs}
      </div>

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: vanish,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            scale: String(groupScale),
            // Shrink toward the check icon so it collapses into a dot.
            transformOrigin: "calc(100% - 32px) 50%",
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 76,
              letterSpacing: "-0.02em",
              color: brand.colors.white,
              opacity: word * textFade,
              translate: `${wordShift}px 0`,
              filter: `blur(${mix(14, 0, word)}px)`,
              clipPath: `inset(-20% 0 -20% ${mix(100, 0, word)}%)`,
            }}
          >
            {brand.copy.intro}
          </span>
          <div style={{ position: "relative", width: ICON, height: ICON }}>
            <div style={{ opacity: morph }}>
              <CheckBadge size={ICON} draw={check} />
            </div>
            {/* The glowing sphere that becomes the badge */}
            <div
              style={{
                position: "absolute",
                left: ICON / 2 - sphereSize / 2 + sphereX(t),
                top: ICON / 2 - sphereSize / 2 + sphereY(t),
                width: sphereSize,
                height: sphereSize,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 50% 45%, #ffffff 0%, #ffffff 38%, rgba(255,255,255,0.55) 58%, rgba(255,255,255,0) 72%)",
                boxShadow: `0 0 ${mix(70, 0, morph)}px ${mix(18, 0, morph)}px rgba(255,255,255,${mix(0.5, 0, morph)})`,
                scale: `${1 / Math.sqrt(stretch)} ${stretch}`,
                opacity: 1 - ramp(t, [I.wordIn[1] - 0.08, I.wordIn[1]]),
                filter: `${sphere.filter === "none" ? "" : sphere.filter} blur(${sphereBlur}px)`.trim(),
              }}
            >
              {sphere.defs}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
