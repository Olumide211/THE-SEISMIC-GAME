import React from 'react';
import {C, FONT} from './theme';

// Monochrome coin badges; stablecoins + Naira carry the green accent.
const GLYPH: Record<string, {g: string; bg: string; fg: string; ring?: string}> = {
  NGN: {g: '₦', bg: '#F5F5F5', fg: '#0B0B0B'},
  USDT: {g: '₮', bg: C.green, fg: '#04140A'},
  USDC: {g: '$', bg: '#0F2E1B', fg: C.greenHi, ring: C.green},
  BTC: {g: '₿', bg: '#2A2A2A', fg: '#F5F5F5'},
  ETH: {g: 'Ξ', bg: '#2A2A2A', fg: '#F5F5F5'},
  SOL: {g: '◎', bg: '#2A2A2A', fg: '#F5F5F5'},
  BNB: {g: '◆', bg: '#2A2A2A', fg: '#F5F5F5'},
  TRX: {g: '▼', bg: '#2A2A2A', fg: '#F5F5F5'},
};

export const CoinIcon: React.FC<{sym: string; size?: number}> = ({sym, size = 36}) => {
  const c = GLYPH[sym];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: c.bg,
        color: c.fg,
        boxShadow: c.ring ? `inset 0 0 0 ${size * 0.06}px ${c.ring}` : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: size * (sym === 'SOL' || sym === 'BNB' || sym === 'TRX' ? 0.42 : 0.52),
        flexShrink: 0,
      }}
    >
      {c.g}
    </div>
  );
};
