import React from "react";

// "→" and "≈" are not in the bundled Inter subsets, so they are drawn as SVG
// that follows the surrounding text size and color.
const glyphStyle: React.CSSProperties = {
  display: "inline-block",
  width: "0.85em",
  height: "0.85em",
  verticalAlign: "-0.08em",
  margin: "0 0.12em",
};

export const ArrowGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" style={glyphStyle}>
    <path
      d="M3 12 H20 M13.5 5.5 L20 12 L13.5 18.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ApproxGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" style={glyphStyle}>
    <path
      d="M4 9.5 C7 6.5 10 6.5 12 9 C14 11.5 17 11.5 20 8.5 M4 16.5 C7 13.5 10 13.5 12 16 C14 18.5 17 18.5 20 15.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </svg>
);
