import React from "react";
import { brand } from "../brand";
import { FONT } from "./fonts";

const C = brand.colors;

export const NairaBadge: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: C.black,
      color: C.white,
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

export const ArrowUpRight: React.FC<{ size: number; color?: string }> = ({ size, color = C.black }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 18 L18 6 M8 6 H18 V16" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SwapIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.black }) => (
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

export const Radio: React.FC<{ size: number; filled: number; color?: string }> = ({ size, filled, color = C.black }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={9.5} fill="none" stroke={color} strokeWidth={2.4} />
    <circle cx={12} cy={12} r={6 * filled} fill={color} />
  </svg>
);

// Spenda's success mark: outer green ring, green disc, white check.
export const SuccessMark: React.FC<{ size: number; ring: number; check: number }> = ({ size, ring, check }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle
      cx={50}
      cy={50}
      r={45}
      fill="none"
      stroke={C.success}
      strokeWidth={8}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - ring}
      transform="rotate(-90 50 50)"
    />
    <circle cx={50} cy={50} r={35 * Math.min(1, ring * 1.15)} fill={C.success} />
    <path
      d="M33 51 L45 62 L68 38"
      fill="none"
      stroke="white"
      strokeWidth={8}
      strokeLinecap="square"
      strokeLinejoin="miter"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - check}
    />
  </svg>
);

export const ClockIcon: React.FC<{ size: number; angle: number; color?: string }> = ({ size, angle, color = "#6B6B6B" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={44} fill="none" stroke={color} strokeWidth={6} />
    {new Array(12).fill(0).map((_, i) => (
      <line
        key={i}
        x1={50}
        y1={12}
        x2={50}
        y2={i % 3 === 0 ? 20 : 16}
        stroke={color}
        strokeWidth={i % 3 === 0 ? 4 : 2}
        transform={`rotate(${i * 30} 50 50)`}
      />
    ))}
    <line x1={50} y1={50} x2={50} y2={30} stroke={color} strokeWidth={6} strokeLinecap="round" transform={`rotate(${angle / 12} 50 50)`} />
    <line x1={50} y1={50} x2={50} y2={18} stroke={color} strokeWidth={4} strokeLinecap="round" transform={`rotate(${angle} 50 50)`} />
    <circle cx={50} cy={50} r={5} fill={color} />
  </svg>
);

export const EyeIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M2 12 C5 6.5 8.5 4.5 12 4.5 C15.5 4.5 19 6.5 22 12 C19 17.5 15.5 19.5 12 19.5 C8.5 19.5 5 17.5 2 12 Z" fill={color} />
    <circle cx={12} cy={12} r={4.2} fill={C.black} />
    <circle cx={12} cy={12} r={2} fill={color} />
  </svg>
);

export const BellIcon: React.FC<{ size: number; color?: string }> = ({ size, color = C.black }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 16 V11 C6 7.5 8.5 5 12 5 C15.5 5 18 7.5 18 11 V16 L19.5 18 H4.5 Z" fill={color} />
    <circle cx={12} cy={20} r={2} fill={color} />
  </svg>
);

export const ChevronDown: React.FC<{ size: number; color?: string }> = ({ size, color = C.black }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 9 L12 15 L18 9" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BackArrow: React.FC<{ size: number; color?: string }> = ({ size, color = C.black }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M20 12 H5 M11 5 L4 12 L11 19" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PdfIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={(size * 4) / 3} viewBox="0 0 60 80">
    <path d="M4 4 H40 L56 20 V76 H4 Z" fill="white" stroke="#111" strokeWidth={3} strokeLinejoin="round" />
    <path d="M40 4 V20 H56" fill="#E5E5E5" stroke="#111" strokeWidth={3} strokeLinejoin="round" />
    <rect x={10} y={44} width={40} height={20} rx={4} fill="#111" />
    <text x={30} y={59} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={14} fill="white">
      PDF
    </text>
    <rect x={12} y={28} width={24} height={4} rx={2} fill="#BDBDBD" />
  </svg>
);

// Padlock whose shackle lifts by `open` (0 = shut).
export const LockIcon: React.FC<{ size: number; open: number; color?: string }> = ({ size, open, color = C.black }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ overflow: "visible" }}>
    <path
      d="M7.5 11 V8 C7.5 5.3 9.5 3.5 12 3.5 C14.5 3.5 16.5 5.3 16.5 8 V11"
      fill="none"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      transform={`translate(0 ${-4 * open})`}
    />
    <rect x={5} y={10.5} width={14} height={10.5} rx={2.5} fill={color} />
  </svg>
);

export const Toggle: React.FC<{ on: number; dark?: number; width?: number }> = ({ on, dark = 0, width = 58 }) => {
  const h = width * 0.58;
  const knob = h - 6;
  const offBg = dark > 0.5 ? "#3A3A3A" : "#D9D9D9";
  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: h / 2,
        background: on > 0.5 ? C.success : offBg,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: 3 + (width - knob - 6) * on,
          width: knob,
          height: knob,
          borderRadius: knob / 2,
          background: "white",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
};
