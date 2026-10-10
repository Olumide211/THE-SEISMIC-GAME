// Shared, frame-driven state of the in-phone UI for S6–S11 (absolute frames),
// so every scene renders the same app state at a given moment.
import { interpolate } from "remotion";
import { brand, toAmount } from "../brand";
import { EASE, prog, sp, mix } from "../anim";
import { HomeAnim } from "../screens/SpendaHome";
import { t } from "../timeline";

const bump = (abs: number, at: number, inF = 3, outF = 5) =>
  prog(abs, at - inF, at) - prog(abs, at + 1, at + 1 + outF);

export const homeState = (abs: number): HomeAnim => {
  const h = t.homeIn;
  return {
    greeting: prog(abs, h, h + 9),
    card: prog(abs, h + 1, h + 12),
    buttons: [0, 1, 2, 3].map((i) => sp(abs, h + 5 + i * 1.5, { damping: 9, stiffness: 260, mass: 0.6 })),
    rows: [0, 1, 2].map((i) => prog(abs, h + 8 + i * 2, h + 18 + i * 2)),
    tabs: prog(abs, h + 3, h + 13),
    depositPress: bump(abs, t.tapDeposit),
    balance: interpolate(abs, [t.balanceRoll[0], t.balanceRoll[1]], [0, brand.depositAmount], {
      easing: EASE,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    cardGlow: prog(abs, t.balanceRoll[0], t.balanceRoll[0] + 4) * (1 - prog(abs, t.balanceRoll[1], t.balanceRoll[1] + 10)),
  };
};

export const sheetState = (abs: number) => {
  const up = sp(abs, t.sheetUp, { damping: 16, stiffness: 170 });
  const down = prog(abs, t.tapDismiss + 1, t.tapDismiss + 8);
  return {
    progress: Math.max(0, up - down * up),
    highlight: prog(abs, t.highlight, t.highlight + 6),
    copyTap: prog(abs, t.tapCopy, t.tapCopy + 12, (x) => x),
    toast: sp(abs, t.tapCopy + 2, { damping: 11, stiffness: 260 }) * (1 - prog(abs, t.tapCopy + 13, t.tapCopy + 17)),
    banner:
      sp(abs, t.cashBanner, { damping: 15, stiffness: 190 }) * (1 - prog(abs, t.wipe - 3, t.wipe + 2)),
  };
};

const DIGITS = String(brand.depositAmount); // "50000"

export const convertState = (abs: number) => {
  const step = (abs - t.typeStart) / t.framesPerDigit;
  const n = Math.max(0, Math.min(DIGITS.length, Math.floor(step) + 1));
  const typed = DIGITS.slice(0, n);
  // live count: between keystrokes the USDT figure eases from the old to the new value
  const prevVal = n > 1 ? Number(DIGITS.slice(0, n - 1)) / brand.rate : 0;
  const curVal = n > 0 ? Number(typed) / brand.rate : 0;
  const within = n >= DIGITS.length ? Math.min(1, (step - (n - 1)) / 3) : step - Math.floor(step);
  const to = n === 0 ? 0 : mix(prevVal, curVal, EASE(Math.max(0, Math.min(1, within))));
  const doneTyping = n >= DIGITS.length;
  const caret = !doneTyping || Math.floor(abs / 7) % 2 === 0;
  return {
    fromAmount: typed,
    toAmount: n >= DIGITS.length && within >= 1 ? toAmount : to,
    caret: abs >= t.wipe + 6 && caret && abs < t.pressConvert - 2,
    swapRotation: 180 * prog(abs, t.swapSpin, t.swapSpin + 12),
    pressed: prog(abs, t.pressConvert - 2, t.pressConvert + 1) - 0.6 * prog(abs, t.pressConvert + 3, t.pressConvert + 7),
    loading: abs >= t.spinner[0] && abs < t.spinner[0] + Math.round(0.5 * 25),
    converted: abs >= t.spinner[0] + Math.round(0.5 * 25),
  };
};
