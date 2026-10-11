import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";

/** "Welcome back — Enter your login PIN" screen that follows the splash. */
export const PinScreen: React.FC<{ filled: number; pressedKey?: number | null }> = ({ filled, pressedKey = null }) => {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: brand.colors.ink }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 150, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <svg width="44" height="44" viewBox="0 0 40 40">
          <circle cx="20" cy="9" r="6.5" fill="#000" />
          <path d="M5 34c0-9 5-15 12-16.5V34z" fill="#000" />
          <path d="M35 24c0 9-5 15-12 16.5V24z" fill="#000" transform="translate(0 -6)" />
        </svg>
        <div style={{ fontSize: 26, fontWeight: 500, marginTop: 16 }}>Welcome back</div>
        <div style={{ fontSize: 14, color: brand.colors.muted, marginTop: 6 }}>Enter your login PIN to continue</div>
        <div style={{ display: "flex", gap: 22, marginTop: 34 }}>
          {[0, 1, 2, 3].map((i) => {
            const on = filled > i;
            return (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  border: "2px solid #000",
                  background: on ? "#000" : "transparent",
                  transform: `scale(${on ? 1.15 : 1})`,
                }}
              />
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", top: 400, left: 40, right: 40, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 28 }}>
        {keys.map((k, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: k === "⌫" ? 22 : 24,
                background: pressedKey === i ? "#EDEDED" : "transparent",
              }}
            >
              {k}
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, textAlign: "center", fontSize: 15 }}>Forgot PIN?</div>
      <HomeIndicator />
    </div>
  );
};
