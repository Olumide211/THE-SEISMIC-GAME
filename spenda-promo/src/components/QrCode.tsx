import React, { useMemo } from "react";
import { seeded } from "../anim";

const N = 25;

/** Decorative QR-style code (finder patterns + seeded modules). Not scannable. */
export const QrCode: React.FC<{ size: number; seed?: number; reveal?: number }> = ({ size, seed = 9, reveal = 1 }) => {
  const cells = useMemo(() => {
    const r = seeded(seed);
    const out: { x: number; y: number }[] = [];
    const inFinder = (x: number, y: number) =>
      (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && r() < 0.48) out.push({ x, y });
    return out;
  }, [seed]);
  const m = size / N;
  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx * m} y={fy * m} width={7 * m} height={7 * m} rx={m * 1.4} fill="#000" />
      <rect x={(fx + 1) * m} y={(fy + 1) * m} width={5 * m} height={5 * m} rx={m} fill="#fff" />
      <rect x={(fx + 2) * m} y={(fy + 2) * m} width={3 * m} height={3 * m} rx={m * 0.6} fill="#000" />
    </g>
  );
  return (
    <svg width={size} height={size}>
      {cells.map((c, i) => {
        const d = (c.x + c.y) / (2 * N);
        if (d > reveal) return null;
        return <rect key={i} x={c.x * m + 0.4} y={c.y * m + 0.4} width={m - 0.8} height={m - 0.8} rx={m * 0.3} fill="#000" />;
      })}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
};
