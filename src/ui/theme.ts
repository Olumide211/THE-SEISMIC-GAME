export const C = {
  bg: '#030303',
  surface: '#0B0B0B',
  card: '#1A1A1A',
  cardHi: '#222222',
  line: '#262626',
  white: '#FFFFFF',
  text: '#F5F5F5',
  grey: '#8A8A8A',
  greyDim: '#5C5C5C',
  green: '#22C55E',
  greenHi: '#86EFAC',
  greenDeep: '#14532D',
  red: '#E5484D',
};

export const FONT = "'Inter', system-ui, sans-serif";

// numbers: medium; labels: regular
export const num = {fontFamily: FONT, fontWeight: 500, fontVariantNumeric: 'tabular-nums' as const, letterSpacing: '-0.02em'};
export const label = {fontFamily: FONT, fontWeight: 400, color: C.grey};
