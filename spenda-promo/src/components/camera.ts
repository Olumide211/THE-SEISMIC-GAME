import { interpolate } from "remotion";
import { EASE } from "../anim";
import { PhonePose } from "./Phone";
import { t, scenes } from "../timeline";

type Key = { at: number } & Required<Omit<PhonePose, "opacity">>;

// Keyframed studio camera for S6–S11, in absolute frames, so the phone moves
// continuously across scene cuts. Each scene samples it with its absolute frame.
const keys: Key[] = [
  { at: scenes.s6.from, scale: 0.55, rotateX: 0, rotateY: -20, rotateZ: 8, x: 40, y: 10 },
  { at: scenes.s7.from, scale: 0.6, rotateX: 2, rotateY: -20, rotateZ: 8, x: 60, y: 0 },
  // dolly in toward the action row (row sits ~70px above screen centre)
  { at: t.tapDeposit - 2, scale: 1.5, rotateX: 10, rotateY: -15, rotateZ: 6, x: -230, y: 130 },
  { at: scenes.s8.from - 2, scale: 1.52, rotateX: 10, rotateY: -15, rotateZ: 6, x: -235, y: 125 },
  // pull back so the whole sheet + top banner is visible
  { at: scenes.s8.from + 8, scale: 1.0, rotateX: 4, rotateY: -14, rotateZ: 3, x: 230, y: 0 },
  { at: scenes.s9.from, scale: 1.0, rotateX: 3, rotateY: -14, rotateZ: 3, x: 240, y: 0 },
  // straighten, fill ~70% of frame
  { at: scenes.s9.from + 12, scale: 0.9, rotateX: 0, rotateY: -8, rotateZ: 0, x: -250, y: 0 },
  { at: scenes.s10.from, scale: 0.9, rotateX: 0, rotateY: -8, rotateZ: 0, x: -250, y: 0 },
  { at: scenes.s10.from + 10, scale: 0.92, rotateX: 0, rotateY: 8, rotateZ: 0, x: 250, y: 0 },
  { at: scenes.s11.from, scale: 0.92, rotateX: 0, rotateY: 6, rotateZ: 0, x: 250, y: 0 },
  { at: scenes.s11.from + 8, scale: 0.78, rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 20 },
  { at: scenes.s11.to, scale: 0.8, rotateX: 0, rotateY: 0, rotateZ: 0, x: 0, y: 20 },
];

const fields = ["scale", "rotateX", "rotateY", "rotateZ", "x", "y"] as const;

export const phonePose = (abs: number): PhonePose => {
  const frames = keys.map((k) => k.at);
  const out: PhonePose = {};
  for (const fld of fields) {
    // piecewise eased between successive keys
    let i = frames.findIndex((fr, idx) => idx < frames.length - 1 && abs >= fr && abs <= frames[idx + 1]);
    if (abs < frames[0]) i = 0;
    if (abs > frames[frames.length - 1]) i = frames.length - 2;
    const a = keys[i];
    const b = keys[i + 1];
    out[fld] = interpolate(abs, [a.at, b.at], [a[fld], b[fld]], {
      easing: EASE,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  // gentle idle sway (±5°) — strongest while the phone is small in S6
  const swayAmt = interpolate(abs, [scenes.s6.from, scenes.s7.from, scenes.s7.from + 10], [5, 5, 1.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  out.rotateY = (out.rotateY ?? 0) + Math.sin((abs - scenes.s6.from) / 9) * swayAmt;
  out.rotateX = (out.rotateX ?? 0) + Math.cos((abs - scenes.s6.from) / 13) * swayAmt * 0.3;
  return out;
};
