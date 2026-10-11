import React from "react";
import { brand, fmt, receiveNaira } from "../brand";
import { FONT } from "../font";
import { SpendaMark } from "../components/SpendaMark";

/** Push banner that slides down from the top of the phone. */
export const NotificationBanner: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 50,
        left: 10,
        right: 10,
        zIndex: 45,
        borderRadius: 22,
        background: "rgba(248,248,250,0.98)",
        boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
        padding: "12px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
        fontFamily: FONT,
        transform: `translateY(${(1 - progress) * -150}px)`,
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 11, background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SpendaMark size={24} />
      </div>
      <div style={{ flex: 1, lineHeight: 1.3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ fontWeight: 600 }}>Spenda</span>
          <span style={{ color: brand.colors.muted }}>now</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: brand.colors.moneyIn }}>+ ₦{fmt(receiveNaira)} received</div>
        <div style={{ fontSize: 12.5, color: brand.colors.muted }}>
          {brand.sendAmount} {brand.coin} deposit converted to Naira
        </div>
      </div>
    </div>
  );
};
