import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";
import { ChevronLeft, MicIcon, PersonGlyph, PhoneIcon, PlusIcon, VideoIcon } from "../components/Icons";
import { ChatBubble, ChatMessage } from "./ChatBubble";
import { TypingDots } from "./TypingDots";

const WA_GREEN = "#25D366";

const ChatHeader: React.FC<{ typing: boolean }> = ({ typing }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 118,
      paddingTop: 58,
      background: "#F7F8FA",
      borderBottom: "1px solid #E3E3E6",
      display: "flex",
      alignItems: "center",
      gap: 10,
      paddingLeft: 10,
      paddingRight: 18,
      fontFamily: FONT,
      zIndex: 5,
    }}
  >
    <ChevronLeft size={26} color="#007AFF" stroke={2.4} />
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        background: "#B8BCC2",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <PersonGlyph size={38} color="#F4F4F5" />
    </div>
    <div style={{ flex: 1, lineHeight: 1.2 }}>
      <div style={{ fontWeight: 600, fontSize: 17, color: "#111" }}>{brand.vendorName}</div>
      <div style={{ fontSize: 13, color: typing ? WA_GREEN : "#667781" }}>{typing ? "typing…" : "online"}</div>
    </div>
    <VideoIcon size={24} color="#007AFF" />
    <div style={{ width: 14 }} />
    <PhoneIcon size={21} color="#007AFF" />
  </div>
);

const ChatInput: React.FC = () => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 92,
      background: "#F7F8FA",
      borderTop: "1px solid #E3E3E6",
      display: "flex",
      alignItems: "flex-start",
      paddingTop: 12,
      gap: 10,
      paddingLeft: 14,
      paddingRight: 14,
      fontFamily: FONT,
    }}
  >
    <PlusIcon size={26} color="#007AFF" />
    <div
      style={{
        flex: 1,
        height: 36,
        borderRadius: 18,
        background: "#fff",
        border: "1px solid #DADADF",
        color: "#A0A0A6",
        fontSize: 15,
        display: "flex",
        alignItems: "center",
        paddingLeft: 14,
      }}
    >
      Message
    </div>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        background: WA_GREEN,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MicIcon size={18} color="#fff" />
    </div>
  </div>
);

/** Faint WhatsApp-ish doodle wallpaper. */
const Wallpaper: React.FC = () => (
  <svg width="390" height="844" style={{ position: "absolute", inset: 0 }}>
    <defs>
      <pattern id="wa-doodle" width="70" height="70" patternUnits="userSpaceOnUse">
        <g fill="none" stroke="#000" strokeWidth="1.4" opacity="0.045">
          <circle cx="14" cy="14" r="6" />
          <path d="M40 10l8 8M48 10l-8 8" />
          <rect x="44" y="40" width="12" height="9" rx="2" />
          <path d="M10 46c4-6 10-6 14 0" />
        </g>
      </pattern>
    </defs>
    <rect width="390" height="844" fill="url(#wa-doodle)" />
  </svg>
);

export const ChatScreen: React.FC<{
  messages: ChatMessage[];
  typing: boolean;
  typingProgress?: number;
}> = ({ messages, typing, typingProgress = 1 }) => {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", fontFamily: FONT }}>
      <Wallpaper />
      <StatusBar />
      <ChatHeader typing={typing} />
      <div
        style={{
          position: "absolute",
          top: 132,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "0 12px",
        }}
      >
        <div style={{ alignSelf: "center", marginBottom: 6 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#54656F",
              background: "#F0F0F2",
              borderRadius: 8,
              padding: "4px 10px",
            }}
          >
            Today
          </span>
        </div>
        {messages.map((m, i) => {
          if (m.progress <= 0.001) return null;
          const me = m.from === "me";
          return (
            <div
              key={i}
              style={{
                alignSelf: me ? "flex-end" : "flex-start",
                transform: `translateY(${(1 - Math.min(1, m.progress)) * 14}px) scale(${0.55 + 0.45 * m.progress})`,
                transformOrigin: me ? "bottom right" : "bottom left",
                opacity: Math.min(1, m.progress * 2),
              }}
            >
              <ChatBubble msg={m} />
            </div>
          );
        })}
        {typing ? (
          <div style={{ alignSelf: "flex-start", opacity: Math.min(1, typingProgress * 2) }}>
            <TypingDots scale={0.6 + 0.4 * Math.min(1, typingProgress)} />
          </div>
        ) : null}
      </div>
      <ChatInput />
      <HomeIndicator />
    </div>
  );
};
