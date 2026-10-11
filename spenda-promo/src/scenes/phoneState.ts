// Shared, frame-driven state of the in-app UI (absolute frames), so every scene
// renders the same app state at a given moment.
import { interpolate } from "remotion";
import { brand, receiveNaira } from "../brand";
import { EASE, prog, sp, mix } from "../anim";
import { HomeAnim, Txn } from "../screens/HomeScreen";
import { t } from "../timeline";

export const depositTxn: Txn = {
  kind: "coin",
  title: `${brand.sendAmount} ${brand.coin}`,
  sub: "Deposit • now",
  amount: `+ ₦${receiveNaira.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
  inflow: true,
};

export const homeState = (abs: number): HomeAnim => {
  const h = t.homeIn;
  return {
    card: prog(abs, h, h + 10),
    actions: [0, 1, 2, 3].map((i) => sp(abs, h + 4 + i * 1.5, { damping: 9, stiffness: 260, mass: 0.6 })),
    rows: [0, 1, 2, 3].map((i) => prog(abs, h + 7 + i * 2, h + 17 + i * 2)),
    balance: interpolate(abs, [t.balanceRoll[0], t.balanceRoll[1]], [0, receiveNaira], {
      easing: EASE,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    newTxn: prog(abs, t.balanceRoll[0] + 2, t.balanceRoll[0] + 12),
    newTxnData: depositTxn,
    cardGlow: prog(abs, t.balanceRoll[0], t.balanceRoll[0] + 5) * (1 - prog(abs, t.balanceRoll[1], t.balanceRoll[1] + 10)),
  };
};

/** Typed digits with a USDT→NGN figure that counts live between keystrokes. */
const typed = (abs: number, start: number, digits: string, perDigit: number) => {
  const step = (abs - start) / perDigit;
  const n = Math.max(0, Math.min(digits.length, Math.floor(step) + 1));
  const within = Math.max(0, Math.min(1, n >= digits.length ? (step - (n - 1)) / 3 : step - Math.floor(step)));
  return { n, text: digits.slice(0, n), within };
};

export const ratesState = (abs: number) => {
  const send = String(brand.sendAmount);
  const tp = typed(abs, t.typeSend, send, 4);
  const val = (s: string) => (s ? Number(s) * (1 - brand.feePct / 100) * brand.rate : 0);
  const prev = val(send.slice(0, tp.n - 1));
  const cur = val(tp.text);
  const receive = tp.n === 0 ? 0 : mix(prev, cur, EASE(tp.within));
  return {
    send: tp.text,
    receive,
    countdown: 6 * 60 + 53 - Math.floor((abs - t.toRates) / 25),
    caret: abs >= t.toRates + 6 && Math.floor(abs / 7) % 2 === 0,
  };
};

export const depositState = (abs: number) => ({
  qr: prog(abs, t.toDeposit + 4, t.toDeposit + 18),
  highlight: prog(abs, t.tapCopy - 6, t.tapCopy),
  copyTap: prog(abs, t.tapCopy, t.tapCopy + 12, (x) => x),
  toast: sp(abs, t.tapCopy + 2, { damping: 11, stiffness: 260 }) * (1 - prog(abs, t.toHome - 4, t.toHome)),
});

export const bannerState = (abs: number) =>
  sp(abs, t.banner, { damping: 15, stiffness: 190 }) * (1 - prog(abs, t.toTransfer - 6, t.toTransfer));

export const transferState = (abs: number) => {
  const tp = typed(abs, t.typeAmount, String(brand.transferAmount), 2);
  const pressed = prog(abs, t.tapSend - 2, t.tapSend + 1) - prog(abs, t.tapSend + 3, t.tapSend + 7);
  return {
    amount: tp.text,
    caret: abs < t.tapSend && Math.floor(abs / 7) % 2 === 0,
    pressed: Math.max(0, pressed),
    loading: abs >= t.tapSend + 1,
    sheet: sp(abs, t.sentSheet, { damping: 16, stiffness: 170 }),
    pop: Math.max(0, sp(abs, t.sentSheet + 4, { damping: 9, stiffness: 220, mass: 0.6 })),
    draw: prog(abs, t.sentSheet + 7, t.sentSheet + 16),
  };
};
