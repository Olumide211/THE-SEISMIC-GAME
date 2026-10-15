import React, { useId } from "react";

// Directional motion blur through an SVG Gaussian filter (separate x and y).
// Returns the <svg> that defines the filter and the CSS `filter` value to use.
export const useDirBlur = (x: number, y: number) => {
  const id = "mb" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const active = x > 0.25 || y > 0.25;
  const defs = active ? (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <filter id={id} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation={`${x.toFixed(2)} ${y.toFixed(2)}`} />
      </filter>
    </svg>
  ) : null;
  return { defs, filter: active ? `url(#${id})` : "none" };
};

export const DirBlur: React.FC<{
  x: number;
  y: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ x, y, style, children }) => {
  const { defs, filter } = useDirBlur(x, y);
  return (
    <div style={{ ...style, filter }}>
      {defs}
      {children}
    </div>
  );
};
