import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { AppIcon } from "../components/AppIcon";
import { DoneCard, CHECK_Y } from "./S12Done";
import { mix, prog, revealAt, sp } from "../anim";
import { scenes, t } from "../timeline";

const ICON = 120;
const WORD_SIZE = 120;
const SLIDE = 230;
const WORD_W = 460; // approx. rendered width of the wordmark // icon travels left so the icon + wordmark lockup ends centred

export const S13EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s13.from;

  // 1) card scales down + blurs away while the app icon condenses out of it
  const out = prog(abs, t.morph, t.morph + 12);
  const iconP = prog(abs, t.morph + 2, t.morph + 16);
  const iconBounce = sp(abs, t.morph + 10, { damping: 10, stiffness: 200 });
  const iconScale = mix(2.1, 1, iconP) * (abs > t.morph + 10 ? 0.96 + 0.04 * iconBounce : 1);
  const iconY = mix(CHECK_Y - 540, -20, iconP);

  // 2) icon slides left, wordmark wipes in from behind it
  const slide = prog(abs, t.slideLeft, t.slideLeft + 14);
  const iconX = -SLIDE * slide;
  const letters = Array.from(brand.name);
  const wordP = prog(abs, t.slideLeft, t.slideLeft + 18);

  const fadeWhite = prog(abs, t.fadeOut, t.fadeOut + 12, (x) => x);

  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {out < 1 ? (
        <AbsoluteFill style={{ transform: `scale(${1 - out * 0.55})`, filter: `blur(${out * 14}px)`, opacity: 1 - out }}>
          <DoneCard abs={abs} />
        </AbsoluteFill>
      ) : null}

      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
        {/* wordmark, revealed from behind the icon via a clip mask */}
        <div
          style={{
            position: "absolute",
            left: iconX + ICON / 2 + 6,
            top: -20,
            transform: "translateY(-50%)",
            overflow: "hidden",
            paddingRight: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: WORD_SIZE,
              letterSpacing: "-0.04em",
              color: brand.colors.textDark,
              lineHeight: 1.1,
              paddingLeft: 24,
              // the whole word slides out from behind the icon; the clip reveals it letter by letter
              transform: `translateX(${(1 - wordP) * -WORD_W}px)`,
            }}
          >
            {letters.map((l, i) => {
              const at = t.slideLeft + 1 + i * 2;
              const s = sp(abs, at, { damping: 12, stiffness: 220, mass: 0.6 });
              return (
                <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - s) * 22}px)` }}>
                  {l}
                </span>
              );
            })}
          </div>
        </div>
        {/* icon sits above the wordmark so letters emerge from behind it */}
        <div
          style={{
            position: "absolute",
            left: iconX - ICON / 2,
            top: iconY - ICON / 2,
            transform: `scale(${iconScale})`,
            filter: iconP < 1 ? `blur(${(1 - iconP) * 12}px)` : undefined,
            opacity: iconP,
            zIndex: 2,
          }}
        >
          <AppIcon size={ICON} id="endIcon" style={{ position: "relative", filter: "drop-shadow(0 14px 22px rgba(91,61,245,0.35))" }} />
        </div>
      </div>

      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, marginTop: 90, textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 36, fontWeight: 600, color: brand.colors.primary, ...revealAt(abs, t.tagline) }}>{brand.tagline}</div>
        <div style={{ fontSize: 28, color: brand.colors.textMuted, marginTop: 18, whiteSpace: "pre", ...revealAt(abs, t.hashtag) }}>
          {brand.hashtag}
          {"   "}
          {brand.handle}
        </div>
      </div>

      <AbsoluteFill style={{ background: "#fff", opacity: fadeWhite }} />
    </AbsoluteFill>
  );
};
