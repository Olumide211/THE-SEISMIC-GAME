import { Easing, interpolate, interpolateColors, spring, useCurrentFrame } from "remotion";
import { FPS } from "../timeline";

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Snappy "expo out", a symmetric in-out, and a hard "expo in".
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

// Absolute time in seconds inside a scene that starts at `sceneStart`.
export const useSceneTime = (sceneStart: number) => {
  const frame = useCurrentFrame();
  return frame / FPS + sceneStart;
};

// 0 -> 1 between two absolute times.
export const ramp = (
  t: number,
  range: readonly [number, number],
  easing: (n: number) => number = easeOut,
) => interpolate(t, range, [0, 1], { ...clamp, easing });

// Snappy spring with a slight overshoot, starting at absolute time `start`.
export const pop = (
  t: number,
  start: number,
  config: Partial<{ damping: number; stiffness: number; mass: number }> = {},
) =>
  spring({
    frame: Math.max(0, (t - start) * FPS),
    fps: FPS,
    config: { damping: 12, stiffness: 190, mass: 0.6, ...config },
  });

export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

export const mixColor = (a: string, b: string, p: number) =>
  interpolateColors(p, [0, 1], [a, b]);

// Speed of a moving value in px per frame, used to size motion blur.
export const speed = (fn: (t: number) => number, t: number) =>
  Math.abs(fn(t) - fn(t - 1 / FPS));

// Motion blur strength from speed, capped so fast moves smear but stay readable.
export const blurFromSpeed = (pxPerFrame: number, k = 0.3, max = 26) =>
  Math.min(max, pxPerFrame * k);
