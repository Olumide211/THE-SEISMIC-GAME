import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { BankIcon, BoltIcon, CopyIcon } from "../components/Icons";
import { Ripple } from "../components/Ripple";

const C = brand.colors;
const SHEET_H = 470;
// Copy button center in sheet coords (for ripple placement).
const COPY = { x: 390 - 20 - 18 - 22, y: 196 };

const SheetHandle = () => (
  <div style={{ width: 40, height: 5, borderRadius: 3, background: "#DDDDE2", margin: "10px auto 18px" }} />
);

const VirtualAccountCard: React.FC<{ highlight: number; copyTap: number }> = ({ highlight, copyTap }) => (
  <div
    style={{
      margin: "0 20px",
      borderRadius: 20,
      background: "#F6F4FF",
      border: `1px solid #E4DEFF`,
      padding: "16px 18px",
      position: "relative",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 17, background: C.textDark, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BankIcon size={18} color="#fff" />
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 12, color: C.textMuted }}>Bank name</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark }}>{brand.bankName}</div>
      </div>
    </div>
    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 16 }}>Account number</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
      <div style={{ position: "relative", padding: "2px 6px", marginLeft: -6 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 8,
            background: C.accent,
            transformOrigin: "left center",
            transform: `scaleX(${highlight})`,
            opacity: 0.85,
          }}
        />
        <span style={{ position: "relative", fontSize: 30, fontWeight: 700, letterSpacing: "0.06em", color: C.textDark, fontVariantNumeric: "tabular-nums" }}>
          {brand.accountNumber}
        </span>
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: C.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 - Math.sin(Math.min(1, copyTap * 3) * Math.PI) * 0.12})`,
        }}
      >
        <CopyIcon size={20} color="#fff" />
      </div>
    </div>
    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 14 }}>Account name</div>
    <div style={{ fontSize: 15, fontWeight: 600, color: C.textDark, marginTop: 2 }}>
      {brand.name} / {brand.userName}
    </div>
  </div>
);

export const DepositNairaSheet: React.FC<{
  progress: number; // sheet position 0 (hidden) → 1 (up)
  highlight?: number;
  copyTap?: number;
  toast?: number;
}> = ({ progress, highlight = 0, copyTap = 0, toast = 0 }) => {
  if (progress <= 0.001) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(10,8,20,${0.45 * Math.min(1, progress)})` }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: SHEET_H,
          background: "#fff",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          transform: `translateY(${(1 - progress) * (SHEET_H + 20)}px)`,
          boxShadow: "0 -10px 30px rgba(0,0,0,0.12)",
        }}
      >
        <SheetHandle />
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ fontSize: 23, fontWeight: 700, color: C.textDark, letterSpacing: "-0.02em" }}>Deposit Naira</div>
          <div style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Transfer to your dedicated Spenda account</div>
        </div>
        <VirtualAccountCard highlight={highlight} copyTap={copyTap} />
        <Ripple p={copyTap} x={COPY.x} y={COPY.y} size={60} color={C.primary} />
        <div
          style={{
            margin: "16px 20px 0",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 14px",
            borderRadius: 14,
            background: "#E9F7F1",
            color: C.stablecoin,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <BoltIcon size={16} color={C.stablecoin} /> Funds arrive instantly
        </div>
        <div style={{ margin: "16px 20px 0", height: 54, borderRadius: 16, border: `1.5px solid ${C.hairline}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: C.textDark }}>
          Share account details
        </div>
        {/* "Copied!" toast */}
        {toast > 0.001 ? (
          <div
            style={{
              position: "absolute",
              right: 22,
              top: COPY.y - 82,
              padding: "8px 14px",
              borderRadius: 12,
              background: C.textDark,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              transform: `translateY(${(1 - Math.min(1, toast)) * 10}px) scale(${0.7 + 0.3 * toast})`,
              transformOrigin: "bottom right",
              opacity: Math.min(1, toast * 1.5),
              boxShadow: "0 8px 18px rgba(0,0,0,0.2)",
            }}
          >
            Copied! ✓
          </div>
        ) : null}
      </div>
    </div>
  );
};
