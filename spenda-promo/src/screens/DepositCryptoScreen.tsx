import React from "react";
import { brand } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";
import { CopyIcon } from "../components/Icons";
import { QrCode } from "../components/QrCode";
import { Ripple } from "../components/Ripple";
import { SpendaMark } from "../components/SpendaMark";
import { InfoBox, SegTabs } from "./RatesScreen";

const C = brand.colors;
export const COPY_POS = { x: 390 - 22 - 28, y: 552 };

const short = (a: string) => `${a.slice(0, 10)}…${a.slice(-6)}`;

export const DepositCryptoScreen: React.FC<{ qr: number; copyTap: number; toast: number; highlight: number }> = ({ qr, copyTap, toast, highlight }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: C.ink }}>
    <StatusBar />
    <div style={{ position: "absolute", top: 62, left: 22, right: 22, display: "flex", alignItems: "center", justifyContent: "center", height: 32 }}>
      <span style={{ position: "absolute", left: 0, fontSize: 26, lineHeight: 1 }}>←</span>
      <span style={{ fontSize: 19 }}>Deposit {brand.coin}</span>
    </div>
    <SegTabs items={["TRC20", "BEP20"]} active={0} top={116} />
    <div style={{ position: "absolute", top: 184, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: 16, borderRadius: 18, border: `1.5px solid ${C.hairline}`, position: "relative", background: "#fff" }}>
        <QrCode size={210} reveal={qr} />
        <div style={{ position: "absolute", left: "50%", top: "50%", width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: 10, background: "#000", border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", opacity: qr }}>
          <SpendaMark size={22} />
        </div>
      </div>
    </div>
    <div style={{ position: "absolute", top: 470, left: 22, right: 22 }}>
      <div style={{ fontSize: 14, color: C.muted }}>Wallet Address ({brand.network})</div>
      <div style={{ marginTop: 8, height: 56, borderRadius: 10, border: `1.5px solid ${C.hairline}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: C.navyTint, transformOrigin: "left", transform: `scaleX(${highlight})` }} />
        <span style={{ position: "relative", fontSize: 16, letterSpacing: "0.01em" }}>{short(brand.walletAddress)}</span>
        <div style={{ position: "relative", transform: `scale(${1 - Math.sin(Math.min(1, copyTap * 3) * Math.PI) * 0.15})` }}>
          <CopyIcon size={22} color="#2F7BEA" />
        </div>
      </div>
    </div>
    <Ripple p={copyTap} x={COPY_POS.x} y={COPY_POS.y} size={56} color="#2F7BEA" />
    {toast > 0.001 ? (
      <div
        style={{
          position: "absolute",
          right: 22,
          top: 420,
          padding: "8px 14px",
          borderRadius: 10,
          background: C.ink,
          color: "#fff",
          fontSize: 14,
          transform: `translateY(${(1 - Math.min(1, toast)) * 10}px) scale(${0.7 + 0.3 * toast})`,
          transformOrigin: "bottom right",
          opacity: Math.min(1, toast * 1.5),
        }}
      >
        Address copied ✓
      </div>
    ) : null}
    <div style={{ position: "absolute", top: 560, left: 0, right: 0 }}>
      <InfoBox top={30}>
        Only send <b>{brand.coin} ({brand.network})</b> to this address. It's converted to Naira at the live rate and credited instantly.
      </InfoBox>
    </div>
    <HomeIndicator />
  </div>
);
