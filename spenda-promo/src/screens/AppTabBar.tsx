import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { CardIcon } from "../components/Icons";
import { SpendaMark } from "../components/SpendaMark";
import { HomeIndicator } from "../components/StatusBar";

const C = brand.colors;

const HomeGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" fill={color} />
  </svg>
);
const RatesGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M7 10h9l-2.5-2.5M17 14H8l2.5 2.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Home · Rates · Cards · Account — as in the live app. */
export const AppTabBar: React.FC<{ active: "home" | "rates" | "cards" | "account" }> = ({ active }) => {
  const tabs = [
    { key: "home", label: "Home" },
    { key: "rates", label: "Rates" },
    { key: "cards", label: "Cards" },
    { key: "account", label: "Account" },
  ] as const;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 84,
        background: "#fff",
        borderTop: `1px solid ${C.hairline}`,
        display: "flex",
        paddingTop: 12,
        fontFamily: FONT,
        zIndex: 10,
      }}
    >
      {tabs.map((tab) => {
        const on = tab.key === active;
        const color = on ? C.ink : "#8E8E93";
        return (
          <div key={tab.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {tab.key === "home" ? <HomeGlyph color={color} /> : null}
              {tab.key === "rates" ? <RatesGlyph color={color} /> : null}
              {tab.key === "cards" ? <CardIcon size={24} color={color} stroke={1.8} /> : null}
              {tab.key === "account" ? (
                <div style={{ width: 23, height: 23, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SpendaMark size={12} />
                </div>
              ) : null}
            </div>
            <span style={{ fontSize: 13, fontWeight: on ? 500 : 400, color }}>{tab.label}</span>
          </div>
        );
      })}
      <HomeIndicator color="#B5B5BA" />
    </div>
  );
};
