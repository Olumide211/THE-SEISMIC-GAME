import React from "react";
import { brand, fmt } from "../brand";
import { FONT } from "../font";
import { StatusBar } from "../components/StatusBar";
import { BankIcon, BellIcon, CopyIcon, EyeIcon, PlusIcon } from "../components/Icons";
import { AppTabBar } from "./AppTabBar";
import { revealStyle } from "../anim";

const C = brand.colors;
const Q = brand.quickActions;

export const HOME_LAYOUT = {
  depositCenter: { x: 22 + 16 + 72, y: 400 },
};

/** White circle with the Spenda "person" glyph — the app's default avatar. */
export const SpendaAvatar: React.FC<{ size: number; bg?: string; fg?: string }> = ({ size, bg = "#fff", fg = "#000" }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
    <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 40 40">
      <circle cx="20" cy="12.5" r="6" fill={fg} />
      <path d="M8 34c0-7.5 4.5-13 9-14.5V34z" fill={fg} />
      <path d="M32 40c0-9-4.5-15.5-10-17V40z" fill={fg} />
    </svg>
  </div>
);

/** The faint rounded tiles in the black balance card. */
const CardTiles: React.FC = () => {
  const tile = (s: React.CSSProperties) => <div style={{ position: "absolute", background: C.cardTile, ...s }} />;
  return (
    <>
      {tile({ left: -10, top: -10, width: 130, height: 210, borderRadius: "0 0 26px 0" })}
      {tile({ left: 140, top: 0, width: 220, height: 200, borderRadius: "110px 26px 26px 26px" })}
      {tile({ left: 45, top: 220, width: 200, height: 220, borderRadius: "26px 26px 0 0" })}
      {tile({ left: 260, top: 220, width: 120, height: 220, borderRadius: "26px 0 0 0" })}
      {tile({ left: -40, top: 222, width: 70, height: 220, borderRadius: "0 26px 0 0" })}
    </>
  );
};

const AirtimeGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6.6 3.2 9.4 3l1.5 4.6-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2 4.6 1.5-.2 2.8a2.2 2.2 0 0 1-2.3 2C10.6 19 5 13.4 4.6 5.5a2.2 2.2 0 0 1 2-2.3z" fill={color} />
  </svg>
);
const DataGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
    <path d="M3 9.5a13 13 0 0 1 18 0M6.5 13a8 8 0 0 1 11 0" />
    <circle cx="12" cy="17" r="1.8" fill={color} stroke="none" />
  </svg>
);
const BillsGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M5 3h14v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4z" fill={color} />
    <path d="M8 8h8M8 11.5h8M8 15h8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const RewardsGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path d="M8 3h8l-1.5 3.5h-5z" fill={color} />
    <path d="M9 7.5h6c3.5 1.5 5.5 5 5 9-.4 2.8-2.7 4.5-5.5 4.5h-5C6.7 21 4.4 19.3 4 16.5c-.5-4 1.5-7.5 5-9z" fill={color} />
    <circle cx="12" cy="14.5" r="2.4" fill="#fff" />
  </svg>
);

export type Txn = { kind: "bank" | "coin" | "airtime" | "bill"; title: string; sub: string; amount: string; inflow?: boolean };

const TxnIcon: React.FC<{ kind: Txn["kind"] }> = ({ kind }) => (
  <div style={{ width: 42, height: 42, borderRadius: 21, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    {kind === "bank" ? <BankIcon size={19} color="#fff" stroke={1.7} /> : null}
    {kind === "coin" ? <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>₮</span> : null}
    {kind === "airtime" ? <AirtimeGlyph color="#fff" size={18} /> : null}
    {kind === "bill" ? <BillsGlyph color="#fff" size={18} /> : null}
  </div>
);

export const TxnRow: React.FC<{ txn: Txn; style?: React.CSSProperties }> = ({ txn, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, height: 59, ...style }}>
    <TxnIcon kind={txn.kind} />
    <div style={{ flex: 1, lineHeight: 1.3, minWidth: 0 }}>
      <div style={{ fontSize: 15, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txn.title}</div>
      <div style={{ fontSize: 13, color: C.muted }}>{txn.sub}</div>
    </div>
    <div style={{ fontSize: 15, color: txn.inflow ? C.moneyIn : C.ink, whiteSpace: "nowrap" }}>{txn.amount}</div>
  </div>
);

const QuickAction: React.FC<{ label: string; c: { bg: string; border: string; icon: string }; glyph: React.ReactNode; scale: number }> = ({
  label,
  c,
  glyph,
  scale,
}) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 72, opacity: Math.min(1, scale * 1.5) }}>
    <div
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${Math.max(0, scale)})`,
        color: c.icon,
      }}
    >
      {glyph}
    </div>
    <span style={{ fontSize: 13.5, color: "#4A4A4F" }}>{label}</span>
  </div>
);

export const DEFAULT_TXNS: Txn[] = [
  { kind: "bank", title: "Ada's Kitchen", sub: "Bank • 7:20 pm", amount: "- ₦1,620.00" },
  { kind: "coin", title: "13 USDC", sub: "Deposit • 5:56 pm", amount: "+ ₦17,465.28", inflow: true },
  { kind: "bill", title: "Ikeja Electric", sub: "Bills • 2:10 pm", amount: "- ₦5,000.00" },
  { kind: "airtime", title: "MTN Airtime", sub: "Airtime • 9:02 am", amount: "- ₦500.00" },
];

export type HomeAnim = {
  card?: number;
  actions?: number[];
  rows?: number[];
  balance?: number;
  depositPress?: number;
  newTxn?: number; // 0..1 slide-in of the incoming deposit row
  newTxnData?: Txn;
  cardGlow?: number;
};

export const HomeScreen: React.FC<HomeAnim> = ({
  card = 1,
  actions = [1, 1, 1, 1],
  rows = [1, 1, 1, 1],
  balance = 0,
  depositPress = 0,
  newTxn = 0,
  newTxnData,
  cardGlow = 0,
}) => {
  const qa = [
    { label: "Airtime", c: Q.airtime, glyph: <AirtimeGlyph color={Q.airtime.icon} /> },
    { label: "Data", c: Q.data, glyph: <DataGlyph color={Q.data.icon} /> },
    { label: "Bills", c: Q.bills, glyph: <BillsGlyph color={Q.bills.icon} /> },
    { label: "Rewards", c: Q.rewards, glyph: <RewardsGlyph color={Q.rewards.icon} /> },
  ];
  const rowShift = newTxn * 59;
  const balWhole = Math.floor(balance);
  const balDec = (balance - balWhole).toFixed(2).slice(1);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: C.ink }}>
      <StatusBar />
      {/* black balance card */}
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 22,
          right: 22,
          height: 400,
          borderRadius: 22,
          background: C.card,
          overflow: "hidden",
          border: "1px solid #E4E4E4",
          opacity: card,
          transform: `translateY(${(1 - card) * 30}px) scale(${0.96 + 0.04 * card})`,
          boxShadow: cardGlow > 0 ? `0 0 ${40 * cardGlow}px rgba(93,168,42,${0.55 * cardGlow})` : undefined,
        }}
      >
        <CardTiles />
        <div style={{ position: "absolute", top: 24, left: 22, display: "flex", alignItems: "center", gap: 12 }}>
          <SpendaAvatar size={34} />
          <div style={{ width: 1.5, height: 18, background: "#fff", opacity: 0.8 }} />
          <div style={{ width: 34, height: 34, borderRadius: 17, border: "1.5px solid #3A3A3A", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <BellIcon size={16} color="#fff" />
            <div style={{ position: "absolute", top: 6, right: 7, width: 6, height: 6, borderRadius: 3, background: "#C81E1E" }} />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 26,
            right: 20,
            padding: "6px 12px",
            borderRadius: 18,
            background: C.navyTint,
            border: `1.5px solid ${C.navyBorder}`,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: C.ink,
          }}
        >
          ID : {brand.userId} <CopyIcon size={15} color={C.ink} />
        </div>
        <div style={{ position: "absolute", top: 162, left: 0, right: 0, textAlign: "center", color: "#fff" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 15 }}>
            Total Balance <EyeIcon size={18} color="#fff" stroke={2.2} />
          </div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ fontSize: 22, fontWeight: 600 }}>₦</span>
            <span style={{ fontSize: 38, fontWeight: 500, letterSpacing: "-0.02em" }}>
              {fmt(balWhole, 0)}
              {balDec}
            </span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 318, left: 22, right: 22, height: 1, background: "#2A2A2A" }} />
        <div style={{ position: "absolute", top: 334, left: 22, right: 22, display: "flex", gap: 14 }}>
          <div
            style={{
              flex: 1,
              height: 50,
              borderRadius: 8,
              background: C.cardButton,
              color: "#fff",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transform: `scale(${1 - depositPress * 0.06})`,
              boxShadow: depositPress > 0 ? `inset 0 0 0 ${2 * depositPress}px #fff` : undefined,
            }}
          >
            <PlusIcon size={17} color="#fff" stroke={2} /> Deposit
          </div>
          <div style={{ flex: 1, height: 50, borderRadius: 8, background: C.cardButton, color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            Transfer <span style={{ fontSize: 17 }}>↑</span>
          </div>
        </div>
      </div>

      {/* quick actions */}
      <div style={{ position: "absolute", top: 470, left: 14, right: 14, display: "flex", justifyContent: "space-between" }}>
        {qa.map((q, i) => (
          <QuickAction key={q.label} {...q} scale={actions[i]} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 566, left: 0, right: 0, height: 1, background: C.hairline }} />

      {/* transactions */}
      <div style={{ position: "absolute", top: 572, left: 22, right: 22, height: 236, overflow: "hidden" }}>
        {newTxnData && newTxn > 0 ? (
          <TxnRow
            txn={newTxnData}
            style={{ position: "absolute", left: 0, right: 0, top: 0, opacity: newTxn, transform: `translateX(${(1 - newTxn) * 40}px)` }}
          />
        ) : null}
        <div style={{ transform: `translateY(${rowShift}px)` }}>
          {DEFAULT_TXNS.map((tx, i) => (
            <TxnRow key={i} txn={tx} style={revealStyle(rows[i] ?? 1)} />
          ))}
        </div>
      </div>
      <AppTabBar active="home" />
    </div>
  );
};
