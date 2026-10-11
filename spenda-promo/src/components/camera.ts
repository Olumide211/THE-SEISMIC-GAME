import { interpolate } from "remotion";
import { EASE } from "../anim";
import { PhonePose } from "./Phone";
import { f, t } from "../timeline";

type Key = { at: number } & Required<Omit<PhonePose, "opacity">>;

// Keyframed studio camera for S5–S10 (absolute frames) so the phone moves
// continuously across scene cuts. At scale ≈5.3 the phone's black splash
// screen fills the whole 1920×1080 frame — the launch animation plays full-bleed,
// then the camera pulls back to reveal it's running on the phone.
const keys: Key[] = [
  { at: t.splash, scale: 5.3, rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 0 },
  { at: t.pullBack, scale: 5.3, rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 0 },
  { at: f(8.2), scale: 0.92, rotateX: 4, rotateY: -16, rotateZ: 4, x: 300, y: 10 },
  // rates
  { at: t.toRates, scale: 0.92, rotateX: 4, rotateY: -16, rotateZ: 4, x: 300, y: 10 },
  { at: t.toRates + 10, scale: 0.96, rotateX: 3, rotateY: 16, rotateZ: -4, x: -300, y: 0 },
  // deposit: drift in toward the wallet address
  { at: t.toDeposit, scale: 0.98, rotateX: 3, rotateY: 15, rotateZ: -4, x: -300, y: 0 },
  { at: t.toDeposit + 10, scale: 1.05, rotateX: 4, rotateY: -14, rotateZ: 3, x: 290, y: -10 },
  { at: t.tapCopy - 2, scale: 1.28, rotateX: 6, rotateY: -12, rotateZ: 3, x: 270, y: -110 },
  // credited: push in on the top of the screen (banner + balance)
  { at: t.toHome, scale: 1.25, rotateX: 6, rotateY: -12, rotateZ: 3, x: 270, y: -100 },
  { at: t.toHome + 10, scale: 1.32, rotateX: 6, rotateY: 12, rotateZ: -3, x: -290, y: 250 },
  { at: t.balanceRoll[1] + 4, scale: 1.36, rotateX: 6, rotateY: 11, rotateZ: -3, x: -290, y: 260 },
  // transfer
  { at: t.toTransfer, scale: 1.2, rotateX: 5, rotateY: 8, rotateZ: -2, x: -200, y: 150 },
  { at: t.toTransfer + 10, scale: 0.95, rotateX: 3, rotateY: -13, rotateZ: 3, x: 300, y: 0 },
  { at: t.versus, scale: 0.95, rotateX: 3, rotateY: -12, rotateZ: 3, x: 300, y: 0 },
  // versus
  { at: t.versus + 8, scale: 0.78, rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 20 },
  { at: f(17.6), scale: 0.8, rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 20 },
];

const fields = ["scale", "rotateX", "rotateY", "rotateZ", "x", "y"] as const;

export const phonePose = (abs: number): PhonePose => {
  const frames = keys.map((k) => k.at);
  let i = frames.findIndex((fr, idx) => idx < frames.length - 1 && abs >= fr && abs <= frames[idx + 1]);
  if (abs < frames[0]) i = 0;
  if (i < 0) i = frames.length - 2;
  const a = keys[i];
  const b = keys[i + 1];
  const out: PhonePose = {};
  for (const fld of fields) {
    out[fld] = interpolate(abs, [a.at, b.at], [a[fld], b[fld]], {
      easing: EASE,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  // gentle idle sway once we're out of the full-bleed splash
  const sway = interpolate(abs, [t.pullBack, f(8.3)], [0, 2.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  out.rotateY = (out.rotateY ?? 0) + Math.sin(abs / 11) * sway;
  out.rotateX = (out.rotateX ?? 0) + Math.cos(abs / 15) * sway * 0.4;
  return out;
};
