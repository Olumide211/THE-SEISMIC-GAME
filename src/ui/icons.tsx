import React from 'react';

type P = {size?: number; color?: string; stroke?: number};
const S: React.FC<P & {children: React.ReactNode}> = ({size = 24, color = 'currentColor', stroke = 1.8, children}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const IHome = (p: P) => (
  <S {...p}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </S>
);
export const IHomeSolid = ({size = 24, color = '#fff'}: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path fill={color} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
);
export const IWallet = (p: P) => (
  <S {...p}>
    <rect x="3" y="6" width="18" height="14" rx="2.5" />
    <path d="M16 13h2M3 9h15a3 3 0 0 0-3-3H6" />
  </S>
);
export const ICard = (p: P) => (
  <S {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3 10h18M7 15h4" />
  </S>
);
export const IGift = (p: P) => (
  <S {...p}>
    <rect x="4" y="9" width="16" height="11" rx="1.5" />
    <path d="M3 9h18M12 9v11M12 9c-1.5-3-5-4-5-1.5S10 9 12 9zm0 0c1.5-3 5-4 5-1.5S14 9 12 9z" />
  </S>
);
export const IUser = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
  </S>
);
export const IBell = (p: P) => (
  <S {...p}>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />
  </S>
);
export const ISearch = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </S>
);
export const IPlus = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
);
export const IArrowUp = (p: P) => (
  <S {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </S>
);
export const IArrowDown = (p: P) => (
  <S {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </S>
);
export const ISwap = (p: P) => (
  <S {...p}>
    <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
  </S>
);
export const IChevron = (p: P) => (
  <S {...p}>
    <path d="m6 9 6 6 6-6" />
  </S>
);
export const IFilter = (p: P) => (
  <S {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </S>
);
export const ILock = (p: P) => (
  <S {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </S>
);
export const IMoon = (p: P) => (
  <S {...p}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
  </S>
);
export const IFinger = (p: P) => (
  <S {...p}>
    <path d="M12 11v4M8.5 8.5A5 5 0 0 1 17 12v2M7 12a5 5 0 0 1 .4-2M7 15.5c.3 1.6 1 3 2 4M17 17c-.3 1.3-.8 2.5-1.5 3.5M12 18.5V21M4.5 9a8.5 8.5 0 0 1 15 0" />
  </S>
);
export const IKey = (p: P) => (
  <S {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M17 6l2 2M15 8l2 2" />
  </S>
);
export const ICheck = (p: P) => (
  <S {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </S>
);
export const IDownload = (p: P) => (
  <S {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </S>
);
export const ICalendar = (p: P) => (
  <S {...p}>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </S>
);
export const IBank = (p: P) => (
  <S {...p}>
    <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
  </S>
);
export const IClock = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </S>
);
export const IBolt = (p: P) => (
  <S {...p}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
  </S>
);
export const IShield = (p: P) => (
  <S {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.2 7.5 9.5 4.3-1.3 7.5-5 7.5-9.5V6z" />
  </S>
);
export const IDoc = (p: P) => (
  <S {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </S>
);
