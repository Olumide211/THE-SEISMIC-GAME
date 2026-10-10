import { CSSProperties } from "react";
import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./timeline";

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const EXPO = Easing.out(Easing.exp);

/** Clamped, eased interpolate. */
export const ease = (
  frame: number,
  input: [number, number] | number[],
  output: [number, number] | number[],
  easing: (t: number) => number = EASE,
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Progress 0→1 between two frames. */
export const prog = (frame: number, from: number, to: number, easing = EASE) =>
  ease(frame, [from, to], [0, 1], easing);

export const sp = (
  frame: number,
  at: number,
  config: Partial<{ damping: number; stiffness: number; mass: number; overshootClamping: boolean }> = {},
) =>
  spring({
    frame: frame - at,
    fps: FPS,
    config: { damping: 14, stiffness: 160, mass: 0.8, ...config },
  });

/** Global text reveal: opacity 0→1, translateY 12→0, blur 8→0. */
export const revealStyle = (p: number, dy = 12): CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dy}px)`,
  filter: p >= 0.999 ? undefined : `blur(${(1 - p) * 8}px)`,
});

export const revealAt = (frame: number, start: number, len = 12) =>
  revealStyle(prog(frame, start, start + len, EXPO));

/** Deterministic PRNG (mulberry32). */
export const seeded = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
