import React from "react";
import { FONT } from "../font";

export const StatusBar: React.FC<{ color?: string }> = ({ color = "#111" }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 54,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 30px 0 40px",
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 16,
      color,
      zIndex: 40,
    }}
  >
    <span>9:41</span>
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="18" height="12" viewBox="0 0 18 12" fill={color}>
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7.3a6 6 0 0 1 8 0" />
        <circle cx="8" cy="10" r="1.2" fill={color} stroke="none" />
      </svg>
      <svg width="26" height="13" viewBox="0 0 26 13">
        <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" fill="none" stroke={color} opacity="0.4" />
        <rect x="2.5" y="2.5" width="17" height="8" rx="2" fill={color} />
        <rect x="23.5" y="4" width="1.8" height="5" rx="0.9" fill={color} opacity="0.4" />
      </svg>
    </div>
  </div>
);

export const HomeIndicator: React.FC<{ color?: string }> = ({ color = "#111" }) => (
  <div
    style={{
      position: "absolute",
      bottom: 8,
      left: "50%",
      width: 134,
      height: 5,
      marginLeft: -67,
      borderRadius: 3,
      background: color,
      zIndex: 40,
    }}
  />
);
