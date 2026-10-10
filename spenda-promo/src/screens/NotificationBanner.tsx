import React from "react";
import { brand, fmtNaira } from "../brand";
import { FONT } from "../font";
import { SpendaMark } from "../components/SpendaMark";

/** iOS-style push banner that slides down from the top of the phone. */
export const NotificationBanner: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 52,
        left: 10,
        right: 10,
        zIndex: 45,
        borderRadius: 22,
        background: "rgba(250,250,252,0.97)",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        fontFamily: FONT,
        transform: `translateY(${(1 - progress) * -140}px)`,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: brand.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SpendaMark size={22} />
      </div>
      <div style={{ flex: 1, lineHeight: 1.25 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ fontWeight: 600, color: brand.colors.textDark }}>Spenda</span>
          <span style={{ color: brand.colors.textMuted }}>now</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: brand.colors.stablecoin }}>
          +₦{fmtNaira(brand.depositAmount)} received
        </div>
        <div style={{ fontSize: 12.5, color: brand.colors.textMuted }}>Naira deposit credited instantly</div>
      </div>
    </div>
  );
};
