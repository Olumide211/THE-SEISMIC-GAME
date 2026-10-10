import React from "react";
import { brand, fmtNaira } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";

const C = brand.colors;

/** Check badge styled after Spenda's own "Transfer sent" ring. */
export const SuccessCheck: React.FC<{ size: number; draw: number; color?: string }> = ({ size, draw, color = "#1FC877" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill={color} />
    <circle cx="50" cy="50" r="38" fill="none" stroke="#fff" strokeWidth="4" />
    <circle cx="50" cy="50" r="33" fill={color} />
    <path
      d="M35 51 L46 61 L67 39"
      fill="none"
      stroke="#fff"
      strokeWidth="8"
      strokeLinecap="square"
      strokeDasharray="60"
      strokeDashoffset={60 * (1 - draw)}
    />
  </svg>
);

export const SuccessScreen: React.FC<{ toAmount: number; pop: number; draw: number; textIn: number }> = ({
  toAmount,
  pop,
  draw,
  textIn,
}) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: C.textDark }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 210, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${pop})` }}>
      <SuccessCheck size={140} draw={draw} />
    </div>
    <div style={{ position: "absolute", top: 390, left: 20, right: 20, textAlign: "center", opacity: textIn, transform: `translateY(${(1 - textIn) * 12}px)` }}>
      <div style={{ fontSize: 17, color: C.textMuted }}>You received</div>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 4 }}>
        {toAmount.toFixed(2)} <span style={{ color: C.stablecoin }}>USDT</span>
      </div>
      <div style={{ fontSize: 14, color: C.textMuted, marginTop: 6 }}>
        from ₦{fmtNaira(brand.depositAmount)} · Fee ₦0 · 3 secs
      </div>
    </div>
    <div style={{ position: "absolute", left: 20, right: 20, bottom: 54, display: "flex", gap: 12, opacity: textIn }}>
      <div style={{ flex: 1, height: 56, borderRadius: 14, border: "1.5px solid #DADADD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 500 }}>
        View Receipt
      </div>
      <div style={{ flex: 1, height: 56, borderRadius: 14, background: C.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600 }}>
        Done
      </div>
    </div>
    <HomeIndicator />
  </div>
);
