import React from "react";
import { brand, fmtNaira } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";
import { Coin, CoinKind } from "../components/Coin";
import {
  ArrowUpRight,
  BankIcon,
  BellIcon,
  CardIcon,
  EyeIcon,
  GiftIcon,
  HomeIcon,
  PlusIcon,
  SwapIcon,
  UserIcon,
  WalletIcon,
} from "../components/Icons";
import { revealStyle } from "../anim";

const C = brand.colors;

// Layout anchors (screen coords) used by scenes for camera targeting / ripples.
export const HOME_LAYOUT = {
  card: { top: 116, height: 182 },
  actionsTop: 322,
  actionSize: 60,
  depositCenter: { x: 20 + 350 / 8, y: 322 + 30 },
  assetsTop: 430,
};

const Greeting: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: "absolute", top: 60, left: 20, right: 20, display: "flex", alignItems: "center", gap: 12, ...style }}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        background: brand.gradient,
        color: "#fff",
        fontWeight: 700,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {brand.userName[0]}
    </div>
    <div style={{ flex: 1, lineHeight: 1.2 }}>
      <div style={{ fontSize: 12.5, color: C.textMuted }}>Welcome back</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: C.textDark }}>Hi, {brand.userName} 👋</div>
    </div>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        border: `1px solid ${C.hairline}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <BellIcon size={20} color={C.textDark} />
      <div style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: 4, background: C.danger }} />
    </div>
  </div>
);

export const BalanceCard: React.FC<{ balance: number; style?: React.CSSProperties; glow?: number }> = ({
  balance,
  style,
  glow = 0,
}) => (
  <div
    style={{
      position: "absolute",
      top: HOME_LAYOUT.card.top,
      left: 20,
      right: 20,
      height: HOME_LAYOUT.card.height,
      borderRadius: 26,
      background: brand.gradient,
      overflow: "hidden",
      color: "#fff",
      padding: "22px 22px",
      boxShadow: `0 16px 32px -14px rgba(91,61,245,${0.55 + glow * 0.4}), 0 0 ${glow * 40}px rgba(198,244,50,${glow * 0.5})`,
      ...style,
    }}
  >
    {/* decorative tiles echoing the Spenda mark */}
    <div style={{ position: "absolute", right: -40, top: -50, width: 170, height: 150, borderRadius: "80px 22px 22px 8px", background: "rgba(255,255,255,0.08)" }} />
    <div style={{ position: "absolute", right: 70, bottom: -70, width: 150, height: 130, borderRadius: "8px 22px 80px 22px", background: "rgba(255,255,255,0.06)" }} />
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, opacity: 0.85, fontWeight: 500 }}>
      Total Balance <EyeIcon size={17} color="#fff" />
    </div>
    <div style={{ fontSize: 36, fontWeight: 700, marginTop: 10, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
      NGN {fmtNaira(balance, 2)}
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
      <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: 20, background: "rgba(255,255,255,0.16)" }}>
        ≈ ${(balance / brand.rate).toFixed(2)}
      </span>
      <span style={{ fontSize: 12, fontWeight: 600, padding: "6px 10px", borderRadius: 20, background: C.accent, color: C.textDark }}>
        Spenda 2.0
      </span>
    </div>
  </div>
);

export const ActionButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  scale?: number;
  opacity?: number;
}> = ({ label, icon, primary, scale = 1, opacity = 1 }) => (
  <div style={{ width: 350 / 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity }}>
    <div
      style={{
        width: HOME_LAYOUT.actionSize,
        height: HOME_LAYOUT.actionSize,
        borderRadius: "50%",
        background: primary ? C.primary : "#F1EEFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${scale})`,
        boxShadow: primary ? "0 8px 18px -6px rgba(91,61,245,0.6)" : undefined,
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: C.textDark }}>{label}</span>
  </div>
);

export const AssetRow: React.FC<{
  kind: CoinKind;
  name: string;
  code: string;
  balance: string;
  sub: string;
  style?: React.CSSProperties;
}> = ({ kind, name, code, balance, sub, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, height: 66, borderBottom: `1px solid ${C.hairline}`, ...style }}>
    <Coin kind={kind} size={42} />
    <div style={{ flex: 1, lineHeight: 1.25 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>{code}</div>
      <div style={{ fontSize: 13, color: C.textMuted }}>{name}</div>
    </div>
    <div style={{ textAlign: "right", lineHeight: 1.25 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.textDark, fontVariantNumeric: "tabular-nums" }}>{balance}</div>
      <div style={{ fontSize: 13, color: C.textMuted }}>{sub}</div>
    </div>
  </div>
);

export const TabBar: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const tabs = [
    { label: "Home", Icon: HomeIcon },
    { label: "Wallet", Icon: WalletIcon },
    { label: "Card", Icon: CardIcon },
    { label: "Rewards", Icon: GiftIcon },
    { label: "Profile", Icon: UserIcon },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 88,
        background: "#fff",
        borderTop: `1px solid ${C.hairline}`,
        display: "flex",
        paddingTop: 10,
        ...style,
      }}
    >
      {tabs.map(({ label, Icon }, i) => {
        const active = i === 0;
        const color = active ? C.primary : "#9A9AA2";
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <Icon size={24} color={color} stroke={active ? 2.3 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, color }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};

export type HomeAnim = {
  greeting?: number;
  card?: number;
  buttons?: number[]; // 4 spring values
  rows?: number[]; // 3 progress values
  tabs?: number;
  depositPress?: number; // 0..1 press depth
  balance?: number;
  cardGlow?: number;
};

export const SpendaHome: React.FC<HomeAnim> = ({
  greeting = 1,
  card = 1,
  buttons = [1, 1, 1, 1],
  rows = [1, 1, 1],
  tabs = 1,
  depositPress = 0,
  balance = 0,
  cardGlow = 0,
}) => {
  const actions = [
    { label: "Deposit", icon: <PlusIcon size={26} color="#fff" stroke={2.6} />, primary: true },
    { label: "Send", icon: <ArrowUpRight size={24} color={C.primary} stroke={2.2} /> },
    { label: "Convert", icon: <SwapIcon size={24} color={C.primary} stroke={2.2} /> },
    { label: "Withdraw", icon: <BankIcon size={23} color={C.primary} stroke={2} /> },
  ];
  const usdt = 0;
  const assets = [
    { kind: "NGN" as const, code: "NGN", name: "Nigerian Naira", balance: `₦${fmtNaira(balance, 2)}`, sub: "Naira wallet" },
    { kind: "USDT" as const, code: "USDT", name: "Tether", balance: usdt.toFixed(2), sub: `₦${fmtNaira(brand.rate)}` },
    { kind: "USDC" as const, code: "USDC", name: "USD Coin", balance: "0.00", sub: `₦${fmtNaira(brand.rate)}` },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT }}>
      <StatusBar />
      <Greeting style={revealStyle(greeting)} />
      <BalanceCard
        balance={balance}
        glow={cardGlow}
        style={{ opacity: card, transform: `translateY(${(1 - card) * 26}px)`, filter: card < 1 ? `blur(${(1 - card) * 6}px)` : undefined }}
      />
      <div style={{ position: "absolute", top: HOME_LAYOUT.actionsTop, left: 20, right: 20, display: "flex" }}>
        {actions.map((a, i) => (
          <ActionButton
            key={a.label}
            {...a}
            scale={Math.max(0, buttons[i]) * (i === 0 ? 1 - depositPress * 0.12 : 1)}
            opacity={Math.min(1, Math.max(0, buttons[i]) * 1.5)}
          />
        ))}
      </div>
      <div style={{ position: "absolute", top: HOME_LAYOUT.assetsTop, left: 20, right: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, ...revealStyle(rows[0]) }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.textDark }}>Assets</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.primary }}>See all</span>
        </div>
        {assets.map((a, i) => (
          <AssetRow key={a.code} {...a} style={{ opacity: rows[i], transform: `translateX(${(1 - rows[i]) * 60}px)` }} />
        ))}
      </div>
      <TabBar style={{ opacity: tabs, transform: `translateY(${(1 - tabs) * 30}px)` }} />
      <HomeIndicator />
    </div>
  );
};
