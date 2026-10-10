import React from "react";

type IconProps = { size?: number; color?: string; stroke?: number; style?: React.CSSProperties };

const Svg: React.FC<IconProps & { children: React.ReactNode; fill?: boolean }> = ({
  size = 24,
  color = "currentColor",
  stroke = 2,
  style,
  children,
  fill,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill ? color : "none"}
    stroke={fill ? "none" : color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "block", flexShrink: 0, ...style }}
  >
    {children}
  </svg>
);

export const EyeIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const CopyIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </Svg>
);
export const PlusIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const ArrowUpRight: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Svg>
);
export const SwapIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4" />
  </Svg>
);
export const BankIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </Svg>
);
export const BellIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
);
export const HomeIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 11 12 4l9 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6h-6v6H4.5A1.5 1.5 0 0 1 3 19.5z" />
  </Svg>
);
export const WalletIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="14" rx="3" />
    <path d="M16 13h2M3 9h15a3 3 0 0 0-3-3" />
  </Svg>
);
export const CardIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
    <path d="M2.5 10h19M6 15h4" />
  </Svg>
);
export const GiftIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="8" width="18" height="5" rx="1" />
    <path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 4s0 4 4 4zM12 8s1.5-5 4-4 0 4-4 4z" />
  </Svg>
);
export const UserIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Svg>
);
export const ChevronLeft: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);
export const ChevronDown: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const VideoIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
    <path d="M15.5 10.5 21 7v10l-5.5-3.5" />
  </Svg>
);
export const PhoneIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />
  </Svg>
);
export const MicIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Svg>
);
export const BoltIcon: React.FC<IconProps> = (p) => (
  <Svg {...p} fill>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Svg>
);
export const CheckIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const DoubleTick: React.FC<IconProps> = ({ size = 16, color = "#53BDEB" }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 18 12" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6.5 4.5 10 11 2.5M7.5 9.5 8 10l6.5-7.5" />
  </svg>
);

/** Little person silhouette used for gray avatars. */
export const PersonGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="15" r="7" fill={color} />
    <path d="M6 36c1.5-8 7.5-12 14-12s12.5 4 14 12z" fill={color} />
  </svg>
);
