import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { brand } from "../brand";
import { Phone } from "../components/Phone";
import { ChatScreen } from "../screens/ChatScreen";
import { ChatMessage } from "../screens/ChatBubble";
import { sp } from "../anim";
import { t, scenes } from "../timeline";

export const chatScript: Omit<ChatMessage, "progress">[] = [
  { from: "me", text: "Sent you 50 USDT 😊", time: "20:14" },
  { from: "them", text: "Send screenshot", time: "20:15" },
  { from: "me", text: "Sent 🙏", time: "20:15" },
  { from: "me", text: "Bro it's been 40 minutes 😭 Where's my Naira?", time: "20:55" },
];
const appearAt = [t.msg1, t.msg2, t.msg3, t.msg4];

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

  return (
    <AbsoluteFill style={{ background: brand.colors.darkBg, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(229,72,77,0.10), rgba(0,0,0,0) 60%)" }} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px)` }}>
        <Phone
          screen={
            <ChatScreen
              messages={messages}
              typing={typing1 || typing2}
              typingProgress={typingP}
              status={abs >= t.lastSeen ? "last seen today at 20:15" : "online"}
            />
          }
          rotateZ={-4}
          rotateY={-6 + 6 * rise}
          rotateX={12 * (1 - rise)}
          scale={1.05}
          y={(1 - rise) * 900 + 20}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
