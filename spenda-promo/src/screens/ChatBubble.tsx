import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { DoubleTick } from "../components/Icons";

export type ChatMessage = {
  from: "me" | "them";
  text: string;
  time?: string;
  /** 0→1 spring progress (values >1 overshoot). */
  progress: number;
};

export const ChatBubble: React.FC<{ msg: Omit<ChatMessage, "progress">; style?: React.CSSProperties }> = ({
  msg,
  style,
}) => {
  const me = msg.from === "me";
  return (
    <div
      style={{
        maxWidth: 270,
        padding: "8px 12px 7px",
        borderRadius: 16,
        [me ? "borderBottomRightRadius" : "borderBottomLeftRadius"]: 5,
        background: me ? "#D9FDD3" : brand.colors.chatGray,
        color: "#111B21",
        fontFamily: FONT,
        fontSize: 16.5,
        lineHeight: 1.32,
        boxShadow: "0 1px 0.5px rgba(11,20,26,0.13)",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        ...style,
      }}
    >
      <span>{msg.text}</span>
      <span
        style={{
          fontSize: 11,
          color: "#667781",
          display: "flex",
          gap: 3,
          alignItems: "center",
          whiteSpace: "nowrap",
          transform: "translateY(2px)",
        }}
      >
        {msg.time ?? "20:14"}
        {me ? <DoubleTick size={16} /> : null}
      </span>
    </div>
  );
};
