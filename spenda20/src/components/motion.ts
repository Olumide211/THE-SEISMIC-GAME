import { Easing, interpolate, interpolateColors, spring, useCurrentFrame } from "remotion";
import { FPS } from "../timeline";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// The move curve from the brief, plus an in-out and a hard ease-in.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

// Absolute time (s) inside a scene that starts at `sceneStart`.
export const useSceneTime = (sceneStart: number) => useCurrentFrame() / FPS + sceneStart;

export const ramp = (
  t: number,
  range: readonly [number, number],
  easing: (n: number) => number = easeOut,
) => interpolate(t, range, [0, 1], { ...clamp, easing });

// Spring with a slight overshoot (damping ~14) that starts at absolute time `start`.
export const pop = (
  t: number,
  start: number,
  config: Partial<{ damping: number; stiffness: number; mass: number }> = {},
) =>
  spring({
    frame: Math.max(0, (t - start) * FPS),
    fps: FPS,
    config: { damping: 14, stiffness: 200, mass: 0.6, ...config },
  });

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const mixColor = (a: string, b: string, p: number) => interpolateColors(p, [0, 1], [a, b]);

// px per frame of a moving value, used to size motion blur.
export const speed = (fn: (t: number) => number, t: number) => Math.abs(fn(t) - fn(t - 1 / FPS));

export const blurFromSpeed = (pxPerFrame: number, k = 0.3, max = 26) => Math.min(max, pxPerFrame * k);

// Short tap dip for a pressed element.
export const tapDip = (t: number, at: number, depth = 0.04, dur = 0.18) =>
  t >= at ? 1 - depth * Math.sin(Math.min(1, (t - at) / dur) * Math.PI) : 1;
