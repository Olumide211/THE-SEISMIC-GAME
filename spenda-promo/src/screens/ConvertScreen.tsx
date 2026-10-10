import React from "react";
import { brand, fmtNaira } from "../brand";
import { FONT } from "../font";
import { StatusBar, HomeIndicator } from "../components/StatusBar";
import { Coin, CoinKind } from "../components/Coin";
import { ChevronDown, ChevronLeft, SwapIcon } from "../components/Icons";
import { Spinner } from "../components/Spinner";

const C = brand.colors;

export const CONVERT_LAYOUT = {
  fromTop: 150,
  cardH: 128,
  gap: 14,
  swap: { x: 195, y: 150 + 128 + 7 },
  toTop: 150 + 128 + 14,
  buttonTop: 844 - 34 - 56 - 20,
};

const CurrencyPill: React.FC<{ kind: CoinKind; code: string }> = ({ kind, code }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 6px 6px", borderRadius: 22, background: "#fff", border: `1px solid ${C.hairline}` }}>
    <Coin kind={kind} size={30} />
    <span style={{ fontSize: 16, fontWeight: 600, color: C.textDark }}>{code}</span>
    <ChevronDown size={16} color={C.textMuted} stroke={2.4} />
  </div>
);

const AmountCard: React.FC<{
  label: string;
  top: number;
  kind: CoinKind;
  code: string;
  amount: React.ReactNode;
  sub: string;
  tint?: string;
}> = ({ label, top, kind, code, amount, sub, tint = "#F6F6F8" }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 20,
      right: 20,
      height: CONVERT_LAYOUT.cardH,
      borderRadius: 22,
      background: tint,
      padding: "16px 18px",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{label}</span>
      <CurrencyPill kind={kind} code={code} />
    </div>
    <div style={{ marginTop: 2, fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", height: 46 }}>
      {amount}
    </div>
    <div style={{ fontSize: 12.5, color: C.textMuted }}>{sub}</div>
  </div>
);

export const ConvertButton: React.FC<{ pressed: number; loading: boolean; done?: boolean }> = ({ pressed, loading, done }) => (
  <div
    style={{
      position: "absolute",
      top: CONVERT_LAYOUT.buttonTop,
      left: 20,
      right: 20,
      height: 56,
      borderRadius: 18,
      background: done ? C.stablecoin : pressed > 0 ? `color-mix(in srgb, ${C.primary}, #000 ${pressed * 22}%)` : C.primary,
      transform: `scale(${1 - 0.03 * pressed})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 17,
      fontWeight: 600,
      boxShadow: "0 12px 24px -10px rgba(91,61,245,0.7)",
    }}
  >
    {done ? "✓ Converted" : loading ? <Spinner size={26} color="#fff" /> : "Convert"}
  </div>
);

export const ConvertScreen: React.FC<{
  fromAmount: string;
  toAmount: number;
  loading?: boolean;
  caret?: boolean;
  swapRotation?: number;
  pressed?: number;
  done?: boolean;
  overlay?: React.ReactNode;
}> = ({ fromAmount, toAmount, loading = false, caret = false, swapRotation = 0, pressed = 0, done = false, overlay }) => {
  const fromNum = Number(fromAmount || "0");
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", fontFamily: FONT, color: C.textDark }}>
      <StatusBar />
      <div style={{ position: "absolute", top: 60, left: 14, display: "flex", alignItems: "center" }}>
        <ChevronLeft size={26} color={C.textDark} stroke={2.2} />
      </div>
      <div style={{ position: "absolute", top: 92, left: 20, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>Convert</div>

      <AmountCard
        label="From"
        top={CONVERT_LAYOUT.fromTop}
        kind="NGN"
        code="NGN"
        sub={`Balance: ₦${fmtNaira(brand.depositAmount, 2)}`}
        amount={
          <span style={{ display: "inline-flex", alignItems: "center", color: fromAmount ? C.textDark : "#C4C4CA" }}>
            ₦{fromAmount ? fmtNaira(fromNum) : "0"}
            <span style={{ width: 2.5, height: 34, marginLeft: 3, borderRadius: 2, background: C.primary, opacity: caret ? 1 : 0 }} />
          </span>
        }
      />
      <AmountCard
        label="To"
        top={CONVERT_LAYOUT.toTop}
        kind="USDT"
        code="USDT"
        tint="#EEF8F4"
        sub={`≈ $${toAmount.toFixed(2)}`}
        amount={<span style={{ color: C.stablecoin }}>{toAmount.toFixed(2)}</span>}
      />
      {/* swap button */}
      <div
        style={{
          position: "absolute",
          left: CONVERT_LAYOUT.swap.x - 26,
          top: CONVERT_LAYOUT.swap.y - 26,
          width: 52,
          height: 52,
          borderRadius: 26,
          background: C.primary,
          border: "5px solid #fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${swapRotation}deg)`,
          zIndex: 3,
        }}
      >
        <SwapIcon size={22} color="#fff" stroke={2.4} />
      </div>

      <div style={{ position: "absolute", top: CONVERT_LAYOUT.toTop + CONVERT_LAYOUT.cardH + 22, left: 20, right: 20, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.hairline}` }}>
          <span style={{ color: C.textMuted }}>Rate</span>
          <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: C.stablecoin }} />1 USDT ≈ ₦{fmtNaira(brand.rate)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.hairline}` }}>
          <span style={{ color: C.textMuted }}>Fee</span>
          <span style={{ fontWeight: 600 }}>
            Fee: ₦0 <span style={{ marginLeft: 6, fontSize: 11, padding: "3px 7px", borderRadius: 8, background: C.accent, color: C.textDark }}>FREE</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
          <span style={{ color: C.textMuted }}>Arrives</span>
          <span style={{ fontWeight: 600 }}>Instantly ⚡</span>
        </div>
      </div>

      <ConvertButton pressed={pressed} loading={loading} done={done} />
      {overlay}
      <HomeIndicator />
    </div>
  );
};
