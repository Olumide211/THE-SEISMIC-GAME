import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { FONT } from "../font";
import { Phone } from "../components/Phone";
import { ChatScreen } from "../screens/ChatScreen";
import { ChatMessage } from "../screens/ChatBubble";
import { prog, sp } from "../anim";
import { t, scenes } from "../timeline";

export const chatScript: Omit<ChatMessage, "progress">[] = [
  { from: "me", text: "I've sent ₦50,000 😊", time: "20:14" },
  { from: "them", text: "Send screenshot", time: "20:15" },
  { from: "me", text: "Sent 🙏", time: "20:15" },
  { from: "me", text: "Bro it's been 40 minutes 😭", time: "20:55" },
];
const appearAt = [t.msg1, t.msg2, t.msg3, t.msg4];

const ClockIcon: React.FC<{ angle: number }> = ({ angle }) => (
  <svg width="54" height="54" viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="23" fill="none" stroke="#fff" strokeWidth="4" />
    <line x1="27" y1="27" x2="27" y2="13" stroke="#fff" strokeWidth="4" strokeLinecap="round" transform={`rotate(${angle / 12} 27 27)`} />
    <line x1="27" y1="27" x2="27" y2="9" stroke={brand.colors.danger} strokeWidth="3" strokeLinecap="round" transform={`rotate(${angle} 27 27)`} />
    <circle cx="27" cy="27" r="3.5" fill="#fff" />
  </svg>
);

export const S2Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const abs = frame + scenes.s2.from;
  const rise = sp(abs, t.phoneRise, { damping: 18, stiffness: 120 });

  const messages: ChatMessage[] = chatScript.map((m, i) => ({
    ...m,
    progress: sp(abs, appearAt[i], { damping: 11, stiffness: 220, mass: 0.6 }),
  }));
  const typing1 = abs >= t.typing1[0] && abs < t.typing1[1];
  const typing2 = abs >= t.typing2[0] && abs < t.typing2[1];
  const typingStart = typing1 ? t.typing1[0] : t.typing2[0];
  const typingP = sp(abs, typingStart, { damping: 12, stiffness: 240 });

  // camera shake
  const shakeT = abs - t.shake;
  const shakeAmp = shakeT >= 0 ? 14 * Math.exp(-shakeT / 4) : 0;
  const sx = Math.sin(shakeT * 2.7) * shakeAmp;
  const sy = Math.cos(shakeT * 3.3) * shakeAmp * 0.6;

  // waiting timer: ticks up from 00:39:51 → 00:40:12 across the scene
  const secs = 39 * 60 + 51 + Math.floor(prog(abs, scenes.s2.from + 8, scenes.s2.to - 4, (x) => x) * 21);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const hudIn = prog(abs, scenes.s2.from + 4, scenes.s2.from + 14);

  return (
    <AbsoluteFill style={{ background: brand.colors.darkBg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(91,61,245,0.18), rgba(0,0,0,0) 60%)" }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <Phone
          screen={<ChatScreen messages={messages} typing={typing1 || typing2} typingProgress={typingP} />}
          rotateZ={-4}
          rotateY={-6 + 6 * rise}
          rotateX={12 * (1 - rise)}
          scale={0.98}
          y={(1 - rise) * 900 + 20}
        />
        {/* HUD: spinning clock + red timer */}
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 90,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: hudIn,
            transform: `translateY(${(1 - hudIn) * 12}px)`,
          }}
        >
          <ClockIcon angle={abs * 38} />
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 46,
              color: brand.colors.danger,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.01em",
              textShadow: "0 0 24px rgba(229,72,77,0.45)",
            }}
          >
            ⏳ 00:{mm}:{ss}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
