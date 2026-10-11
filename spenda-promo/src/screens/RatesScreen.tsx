import React from "react";
import { brand, fmt } from "../brand";
import { FONT } from "../font";
import { StatusBar } from "../components/StatusBar";
import { ChevronDown } from "../components/Icons";
import { Coin } from "../components/Coin";
import { AppTabBar } from "./AppTabBar";

const C = brand.colors;

export const SegTabs: React.FC<{ items: [string, string]; active: 0 | 1; top: number }> = ({ items, active, top }) => (
  <div style={{ position: "absolute", top, left: 22, right: 22, height: 44, display: "flex", border: `1.5px solid ${C.hairline}`, borderRadius: 4, overflow: "hidden" }}>
    {items.map((it, i) => (
      <div
        key={it}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          background: i === active ? C.navy : "#fff",
          color: i === active ? "#fff" : C.ink,
        }}
      >
        {it}
      </div>
    ))}
  </div>
);

export const InfoBox: React.FC<{ children: React.ReactNode; top: number }> = ({ children, top }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 22,
      right: 22,
      borderRadius: 12,
      background: C.navyTint,
      border: `1.5px solid ${C.navyBorder}`,
      padding: "14px 16px 14px 46px",
      fontSize: 13.5,
      lineHeight: 1.5,
      color: "#222",
    }}
  >
    <div style={{ position: "absolute", left: 14, top: 15, width: 20, height: 20, borderRadius: 10, border: `2px solid ${C.navy}`, color: C.navy, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
      i
    </div>
    {children}
  </div>
);

/** Rates → Calculator tab, as in the live app. */
export const RatesScreen: React.FC<{ send: string; receive: number; countdown: number; caret: boolean }> = ({ send, receive, countdown, caret }) => {
  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");
  const sendNum = Number(send || "0");
  const fee = (sendNum * brand.feePct) / 100;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: C.ink }}>
      <StatusBar />
      <SegTabs items={["Rates", "Calculator"]} active={1} top={58} />
      <div
        style={{
          position: "absolute",
          top: 118,
          left: 22,
          right: 22,
          height: 92,
          borderRadius: 10,
          background: C.navyTint,
          border: `1.5px solid ${C.navyBorder}`,
          borderBottom: `5px solid ${C.navy}`,
          textAlign: "center",
          paddingTop: 12,
        }}
      >
        <div style={{ fontSize: 14, color: "#555" }}>Rate refreshes in</div>
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "0.02em", fontVariantNumeric: "tabular-nums" }}>
          {mm} : {ss}
        </div>
      </div>
      <div style={{ position: "absolute", top: 232, left: 22, right: 22, border: `1.5px solid ${C.hairline}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1.5px solid ${C.hairline}` }}>
          <div>
            <div style={{ fontSize: 14, color: "#555" }}>You Send</div>
            <div style={{ fontSize: 30, fontWeight: 600, display: "flex", alignItems: "center", height: 40 }}>
              {send || <span style={{ color: "#BDBDC2" }}>0</span>}
              <span style={{ width: 2, height: 28, marginLeft: 3, background: C.navy, opacity: caret ? 1 : 0 }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px 7px 8px", borderRadius: 24, border: `1.5px solid ${C.hairline}` }}>
            <Coin kind="USDT" size={28} />
            <span style={{ fontSize: 16 }}>{brand.coin}</span>
            <ChevronDown size={16} color={C.ink} stroke={2.4} />
          </div>
        </div>
        <div style={{ padding: "12px 16px", fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${C.hairline}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>$</span>
              Exchange Rate
            </span>
            <span>
              $1 = ₦{fmt(brand.rate, 0)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${C.hairline}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>⇅</span>
              Fee
            </span>
            <span>
              {brand.feePct}% = ${fee.toFixed(2)}
            </span>
          </div>
        </div>
        <div style={{ padding: "14px 16px", background: "#EBEBEB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, color: "#555" }}>You Receive</div>
            <div style={{ fontSize: 30, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(receive, 2)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px 7px 8px", borderRadius: 24, border: "1.5px solid #D6D6D6" }}>
            <Coin kind="NGN" size={28} style={{ background: "#5DA82A" }} />
            <span style={{ fontSize: 16 }}>Naira</span>
          </div>
        </div>
      </div>
      <InfoBox top={560}>Exchange rates are updated every 30 minutes so your deposits are converted at the best rates in the market.</InfoBox>
      <AppTabBar active="rates" />
    </div>
  );
};
