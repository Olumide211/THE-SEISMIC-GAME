import React from "react";
import { brand } from "../brand";
import { FONT } from "../components/fonts";
import {
  BackArrow,
  BellIcon,
  ChevronDown,
  EyeIcon,
  LockIcon,
  Toggle,
} from "../components/Icons";
import { SCREEN } from "../components/Phone";
import { SHEET, SuccessSheet } from "../components/SuccessSheet";
import { mix, mixColor, ramp } from "../components/motion";

const C = brand.colors;

// Staggered build-in for UI that lands after the screen arrives.
const useIn = (t: number, start: number) => (i: number) => ramp(t, [start + i * 0.07, start + i * 0.07 + 0.34]);

const rise = (p: number, d = 22): React.CSSProperties => ({
  opacity: p,
  translate: `0 ${mix(d, 0, p)}px`,
  filter: `blur(${mix(6, 0, p)}px)`,
});

const slideIn = (p: number): React.CSSProperties => ({
  opacity: p,
  translate: `${mix(60, 0, p)}px 0`,
});

const StatusBar: React.FC<{ color?: string }> = ({ color = C.black }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 34px 0 40px",
      fontFamily: FONT,
      fontWeight: 600,
      fontSize: 17,
      color,
    }}
  >
    <span>9:41</span>
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {[6, 9, 12, 15].map((h, i) => (
        <div key={i} style={{ width: 4, height: h, borderRadius: 1, background: color }} />
      ))}
      <div style={{ marginLeft: 6, width: 26, height: 13, borderRadius: 4, border: `2px solid ${color}`, padding: 1 }}>
        <div style={{ width: "75%", height: "100%", borderRadius: 2, background: color }} />
      </div>
    </div>
  </div>
);

const TabBar: React.FC<{ p: number; active: number; dark?: number }> = ({ p, active, dark = 0 }) => {
  const ink = mixColor(C.black, C.white, dark);
  const dim = mixColor("#9B9B9B", "#6B6B6B", dark);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 92,
        borderTop: `1px solid ${mixColor("#EDEDED", "#222", dark)}`,
        display: "flex",
        justifyContent: "space-around",
        paddingTop: 14,
        background: mixColor(C.white, "#0A0A0A", dark),
        ...rise(p, 30),
      }}
    >
      {["Home", "Rates", "Cards", "Account"].map((label, i) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ width: 26, height: 26, borderRadius: i === 2 ? 5 : 13, background: i === active ? ink : dim }} />
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: i === active ? 600 : 400, color: i === active ? ink : dim }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

const AssetIcon: React.FC<{ kind: "ngn" | "usdt" | "usdc" }> = ({ kind }) => {
  const bg =
    kind === "usdt"
      ? `radial-gradient(circle at 30% 28%, ${C.usdtLight} 0%, ${C.successDeep} 85%)`
      : kind === "ngn"
        ? C.black
        : "#1F1F1F";
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 24,
        boxShadow: kind === "usdc" ? "inset 0 0 0 3px #fff, inset 0 0 0 5px #1F1F1F" : undefined,
      }}
    >
      {kind === "ngn" ? "₦" : kind === "usdt" ? "₮" : "$"}
    </div>
  );
};

export const HomeScreen: React.FC<{ t: number; start: number }> = ({ t, start }) => {
  const p = useIn(t, start);
  const assets = [
    { kind: "ngn" as const, name: "NGN", sub: "Nigerian Naira" },
    { kind: "usdt" as const, name: "USDT", sub: "Tether" },
    { kind: "usdc" as const, name: "USDC", sub: "USD Coin" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: C.white, fontFamily: FONT }}>
      <StatusBar />
      <div
        style={{
          position: "absolute",
          top: 66,
          left: 26,
          right: 26,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          ...rise(p(0)),
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>Hi, {brand.data.user} 👋</span>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: C.field, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BellIcon size={22} />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 128,
          left: 20,
          right: 20,
          height: 236,
          borderRadius: 28,
          background: C.black,
          color: C.white,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 36,
          ...rise(p(1), 30),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 17 }}>
          Total Balance <EyeIcon size={22} />
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 10 }}>
          {brand.data.maskedBalance}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, width: "100%", padding: "0 20px" }}>
          {["+  Deposit", "Transfer  ↑"].map((b) => (
            <div
              key={b}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 14,
                background: "#262626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 394, left: 26, fontSize: 19, fontWeight: 700, ...rise(p(2)) }}>Assets</div>
      {assets.map((a, i) => (
        <div
          key={a.name}
          style={{
            position: "absolute",
            top: 436 + i * 84,
            left: 20,
            right: 20,
            height: 72,
            borderRadius: 18,
            background: C.field,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 16px",
            ...slideIn(p(3 + i)),
          }}
        >
          <AssetIcon kind={a.kind} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 600 }}>{a.name}</div>
            <div style={{ fontSize: 14, color: C.muted }}>{a.sub}</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "0.1em" }}>••••</span>
        </div>
      ))}
      <TabBar p={p(2)} active={0} />
    </div>
  );
};

export const StatementScreen: React.FC<{ t: number; start: number; tap: number; pulse: number }> = ({
  t,
  start,
  tap,
  pulse,
}) => {
  const p = useIn(t, start);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.white, fontFamily: FONT }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 70, left: 24, right: 24, display: "flex", alignItems: "center", gap: 14, ...rise(p(0)) }}>
        <BackArrow size={26} />
        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Account Statement</span>
      </div>
      <div style={{ position: "absolute", top: 120, left: 24, right: 24, fontSize: 16, color: C.muted, ...rise(p(1)) }}>
        Download your transaction history.
      </div>

      <div style={{ position: "absolute", top: 180, left: 24, right: 24, ...rise(p(2)) }}>
        <div style={{ fontSize: 15, color: C.muted, marginBottom: 10 }}>Timeline</div>
        <div
          style={{
            height: 62,
            borderRadius: 16,
            background: C.field,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            fontSize: 19,
            fontWeight: 600,
            boxShadow: `inset 0 0 0 ${mix(0, 2, ramp(t, [start + 0.45, start + 0.6]))}px ${C.black}`,
          }}
        >
          Last 1 month
          <ChevronDown size={24} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 300, left: 24, right: 24, ...rise(p(3)) }}>
        <div style={{ fontSize: 15, color: C.muted, marginBottom: 10 }}>Account</div>
        <div style={{ height: 62, borderRadius: 16, background: C.field, display: "flex", alignItems: "center", padding: "0 18px", fontSize: 19, fontWeight: 600 }}>
          NGN Wallet
        </div>
      </div>

      <div style={{ position: "absolute", top: 420, left: 24, right: 24, ...rise(p(4)) }}>
        <div style={{ fontSize: 15, color: C.muted, marginBottom: 10 }}>Format</div>
        <div style={{ display: "flex", gap: 12 }}>
          {["PDF", "CSV"].map((f, i) => (
            <div
              key={f}
              style={{
                padding: "12px 26px",
                borderRadius: 14,
                fontSize: 17,
                fontWeight: 600,
                background: i === 0 ? C.black : C.white,
                color: i === 0 ? C.white : C.black,
                border: i === 0 ? "none" : `2px solid ${C.border}`,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 700,
          left: 24,
          right: 24,
          height: 66,
          borderRadius: brand.radius.button,
          background: C.black,
          color: C.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 600,
          scale: String(pulse * tap),
          boxShadow: `0 0 0 ${pulse > 1 ? (pulse - 1) * 300 : 0}px rgba(0,0,0,0.12)`,
          ...rise(p(5), 30),
        }}
      >
        Download
      </div>
    </div>
  );
};

export const SecurityScreen: React.FC<{
  t: number;
  start: number;
  dark: number;
  darkOn: number;
  tfaOn: number;
  lockOpen: number;
}> = ({ t, start, dark, darkOn, tfaOn, lockOpen }) => {
  const p = useIn(t, start);
  const bg = mixColor(C.white, "#0A0A0A", dark);
  const ink = mixColor(C.black, C.white, dark);
  const field = mixColor(C.field, "#1C1C1C", dark);
  const row = (label: string, sub: string, right: React.ReactNode, icon?: React.ReactNode) => (
    <div
      style={{
        height: 76,
        borderRadius: 18,
        background: field,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 18px",
      }}
    >
      {icon}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: ink }}>{label}</div>
        <div style={{ fontSize: 13, color: C.muted }}>{sub}</div>
      </div>
      {right}
    </div>
  );
  const chevron = <span style={{ fontSize: 26, color: C.muted }}>›</span>;
  return (
    <div style={{ position: "absolute", inset: 0, background: bg, fontFamily: FONT }}>
      <StatusBar color={ink} />
      <div style={{ position: "absolute", top: 70, left: 24, display: "flex", alignItems: "center", gap: 14, ...rise(p(0)) }}>
        <BackArrow size={26} color={ink} />
        <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: ink }}>Security</span>
      </div>

      <div style={{ position: "absolute", top: 140, left: 20, right: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 14, color: C.muted, marginLeft: 6, ...rise(p(1)) }}>Appearance</div>
        <div style={rise(p(2))}>{row("Dark Mode", "Easy on the eyes", <Toggle on={darkOn} dark={dark} />)}</div>
        <div style={{ fontSize: 14, color: C.muted, marginLeft: 6, marginTop: 14, ...rise(p(3)) }}>Protection</div>
        <div style={rise(p(4))}>
          {row(
            "Two-Factor Auth",
            "Extra code on every login",
            <Toggle on={tfaOn} dark={dark} />,
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: mixColor(C.white, "#262626", dark),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockIcon size={24} open={lockOpen} color={ink} />
            </div>,
          )}
        </div>
        <div style={rise(p(5))}>{row("Change PIN", "Last changed 2 months ago", chevron)}</div>
        <div style={rise(p(6))}>{row("Biometric Login", "Face ID", chevron)}</div>
      </div>
      <TabBar p={p(3)} active={3} dark={dark} />
    </div>
  );
};

// The success sheet as it looks on the phone screen.
export const PhoneSuccess: React.FC = () => {
  const s = SCREEN.w / SHEET.w;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.sheetBackdrop }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: SHEET.w,
          height: SHEET.h,
          transformOrigin: "0 100%",
          scale: String(s),
        }}
      >
        <SuccessSheet ring={1} check={1} textP={1} />
      </div>
    </div>
  );
};
