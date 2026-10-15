import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";

export const CheckBadge: React.FC<{ size: number; draw: number; bg?: string; fg?: string }> = ({
  size,
  draw,
  bg = brand.colors.white,
  fg = brand.colors.black,
}) => (
  <svg width={size} height={size} viewBox="0 0 48 48">
    <circle cx={24} cy={24} r={23} fill={bg} />
    <path
      d="M14 24.5 L21 31.5 L34.5 17.5"
      fill="none"
      stroke={fg}
      strokeWidth={5.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
    />
  </svg>
);

export const NairaBadge: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: brand.colors.black,
      color: brand.colors.white,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: size * 0.56,
      boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
    }}
  >
    ₦
  </div>
);

export const ArrowUpRight: React.FC<{ size: number; color?: string }> = ({
  size,
  color = brand.colors.black,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 21 L21 3 L13.5 21 L11.5 12.5 Z" fill={color} />
  </svg>
);

export const SwapIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = brand.colors.black,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M7 4 L7 18 M7 18 L3.5 14.5 M7 18 L10.5 14.5 M17 20 L17 6 M17 6 L13.5 9.5 M17 6 L20.5 9.5"
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Radio: React.FC<{ size: number; filled: number; color?: string }> = ({
  size,
  filled,
  color = brand.colors.black,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={9.5} fill="none" stroke={color} strokeWidth={2.6} />
    <circle cx={12} cy={12} r={6.5 * filled} fill={color} />
  </svg>
);
