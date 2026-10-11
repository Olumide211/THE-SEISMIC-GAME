import React from "react";
import { brand, fmt, receiveNaira } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";
import { BankIcon } from "../components/Icons";
import { Spinner } from "../components/Spinner";

const C = brand.colors;
export const SEND_BTN = { top: 844 - 40 - 56, h: 56 };

/** Bank transfer: recipient, amount (typed), black Send button. */
export const TransferScreen: React.FC<{ amount: string; caret: boolean; pressed: number; loading: boolean }> = ({ amount, caret, pressed, loading }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: C.ink }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 62, left: 22, right: 22, display: "flex", alignItems: "center", justifyContent: "center", height: 32 }}>
      <span style={{ position: "absolute", left: 0, fontSize: 26, lineHeight: 1 }}>←</span>
      <span style={{ fontSize: 19 }}>Transfer</span>
    </div>
    <div style={{ position: "absolute", top: 120, left: 22, right: 22 }}>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 8 }}>To</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: `1.5px solid ${C.hairline}` }}>
        <div style={{ width: 42, height: 42, borderRadius: 21, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BankIcon size={19} color="#fff" stroke={1.7} />
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ fontSize: 16 }}>{brand.recipient}</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            {brand.recipientBank} • {brand.recipientAccount}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 14, color: C.muted, margin: "26px 0 8px" }}>Amount</div>
      <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em", height: 60 }}>
        <span style={{ color: amount ? C.ink : "#BDBDC2" }}>₦{amount ? fmt(Number(amount), 0) : "0"}</span>
        <span style={{ width: 2.5, height: 40, marginLeft: 4, background: C.ink, opacity: caret ? 1 : 0 }} />
      </div>
      <div style={{ fontSize: 13.5, color: C.muted, marginTop: 6 }}>Balance: ₦{fmt(receiveNaira)}</div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        {["₦5,000", "₦10,000", "₦45,000", "Max"].map((q) => (
          <div key={q} style={{ padding: "8px 12px", borderRadius: 18, border: `1.5px solid ${C.hairline}`, fontSize: 13.5 }}>
            {q}
          </div>
        ))}
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: SEND_BTN.top,
        left: 22,
        right: 22,
        height: SEND_BTN.h,
        borderRadius: 10,
        background: pressed > 0 ? "#333" : C.ink,
        transform: `scale(${1 - 0.03 * pressed})`,
        color: "#fff",
        fontSize: 17,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading ? <Spinner size={24} color="#fff" /> : "Send"}
    </div>
    <HomeIndicator />
  </div>
);

/** The real "Transfer sent" bottom sheet: green ring check, View Receipt / Done. */
export const SuccessRing: React.FC<{ size: number; draw: number }> = ({ size, draw }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="49" fill={C.success} />
    <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="4.5" />
    <circle cx="50" cy="50" r="34" fill={C.success} />
    <path d="M33 52 L45 62 L68 37" fill="none" stroke="#fff" strokeWidth="7.5" strokeLinecap="square" strokeDasharray="64" strokeDashoffset={64 * (1 - draw)} />
  </svg>
);

export const TransferSentSheet: React.FC<{ progress: number; pop: number; draw: number }> = ({ progress, pop, draw }) => {
  if (progress <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 30, fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(120,122,112,${0.55 * Math.min(1, progress)})` }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 430,
          background: "#fff",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          transform: `translateY(${(1 - progress) * 450}px)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "#E4E4E4", marginTop: 12 }} />
        <div style={{ marginTop: 42, transform: `scale(${pop})` }}>
          <SuccessRing size={98} draw={draw} />
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, marginTop: 34, color: C.ink }}>Transfer sent</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
          ₦{fmt(brand.transferAmount, 0)} to {brand.recipient}
        </div>
        <div style={{ display: "flex", gap: 14, position: "absolute", bottom: 46, left: 22, right: 22 }}>
          <div style={{ flex: 1, height: 64, borderRadius: 10, border: "2px solid #DADADA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            View Receipt
          </div>
          <div style={{ flex: 1, height: 64, borderRadius: 10, background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>
            Done
          </div>
        </div>
      </div>
    </div>
  );
};
