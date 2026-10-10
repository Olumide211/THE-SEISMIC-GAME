import React from "react";

/** Faint tiled doodles: coins, ₦ and $ symbols. */
export const DoodleBg: React.FC<{ opacity?: number; color?: string }> = ({ opacity = 0.04, color = "#000" }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity }}>
    <defs>
      <pattern id="doodle" width="180" height="180" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
        <g fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="36" cy="38" r="20" />
          <circle cx="36" cy="38" r="13" />
          <path d="M120 22v36M110 30q10-8 20 0t-10 12q-12 4-10 10t20 0" />
          <path d="M28 118v34M48 118v34M28 118l20 34M22 130h32M22 140h32" />
          <circle cx="132" cy="132" r="18" />
          <path d="M126 124h12M132 124v18M124 130q8 3 16 0" />
          <path d="M80 86l6-6 6 6-6 6z" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#doodle)" />
  </svg>
);
