import React from "react";
import { AbsoluteFill } from "remotion";
import { prog } from "../anim";

/** iOS-style push between two in-phone screens, starting at `at` (absolute frame). */
export const ScreenPush: React.FC<{
  abs: number;
  at: number;
  from: React.ReactNode;
  to: React.ReactNode;
  frames?: number;
  direction?: 1 | -1;
}> = ({ abs, at, from, to, frames = 9, direction = 1 }) => {
  const p = prog(abs, at, at + frames);
  if (p <= 0) return <>{from}</>;
  if (p >= 1) return <>{to}</>;
  return (
    <>
      <AbsoluteFill style={{ transform: `translateX(${-p * 30 * direction}%)`, filter: `brightness(${1 - p * 0.15})` }}>{from}</AbsoluteFill>
      <AbsoluteFill style={{ transform: `translateX(${(1 - p) * 100 * direction}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,0.15)" }}>{to}</AbsoluteFill>
    </>
  );
};
