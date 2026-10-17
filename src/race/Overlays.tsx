import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp01, easeInOut, easeOut, expoOut, lerp, prog, smooth} from '../engine/kit';
import {FONT} from '../ui/theme';

/* Captions: 2-5 words, large white Inter semibold, centered, subtle drop shadow.
   Placed in the lower third, clear of the phones in wide shots. */
const CAPTIONS: [number, number, string][] = [
  [0.25, 1.3, '$100 USDT → Naira.'],
  [1.3, 2.45, 'Two apps. One race.'],
  [5.5, 8.85, 'Waiting… and praying 😮‍💨'],
  [15.75, 17.45, 'Money in your bank. Seconds.'],
  [18.0, 20.9, 'Already spending it.'],
  [21.5, 23.95, 'Still waiting?'],
  [24.2, 25.65, 'No vendor. No screenshots. No wahala.'],
  [25.7, 26.95, 'Spenda: crypto to cash in seconds.'],
];

export const Captions: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {CAPTIONS.map(([a, b, text]) => {
      if (t < a - 0.05 || t > b + 0.05) return null;
      const inK = easeOut(prog(t, a, a + 0.22));
      const outK = smooth(prog(t, b - 0.18, b));
      const o = inK * (1 - outK);
      return (
        <div
          key={text}
          style={{
            position: 'absolute',
            left: 70,
            right: 70,
            top: 1460,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: text.length > 28 ? 66 : 78,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            opacity: o,
            transform: `translateY(${lerp(26, 0, inK)}px)`,
            textShadow: '0 4px 18px rgba(0,0,0,0.75), 0 1px 3px rgba(0,0,0,0.9)',
            filter: `blur(${(1 - inK) * 6}px)`,
          }}
        >
          {text}
        </div>
      );
    })}
  </AbsoluteFill>
);

/* soft green + red "GO" streak passing over both screens just after the taps */
export const GoStreak: React.FC<{t: number}> = ({t}) => {
  const k = prog(t, 3.95, 4.5);
  if (k <= 0 || k >= 1) return null;
  const x = lerp(-700, 1500, easeInOut(k));
  const a = Math.sin(Math.PI * k);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: x,
          width: 420,
          height: 1400,
          transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(229,72,77,0) 0%, rgba(229,72,77,0.5) 30%, rgba(255,255,255,0.75) 50%, rgba(34,197,94,0.55) 70%, rgba(34,197,94,0) 100%)',
          filter: 'blur(26px)',
          opacity: a * 0.85,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 820,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 220,
          letterSpacing: '0.04em',
          color: '#FFFFFF',
          opacity: clamp01(a * 1.4) * 0.9,
          transform: `scale(${lerp(0.85, 1.1, k)})`,
          textShadow: '0 0 40px rgba(34,197,94,0.8), 0 0 80px rgba(229,72,77,0.5)',
        }}
      >
        GO
      </div>
    </AbsoluteFill>
  );
};

/* big race counter in the corner during the Spenda run */
export const Counter: React.FC<{t: number}> = ({t}) => {
  if (t < 8.9 || t > 17.6) return null;
  const secs = Math.min(9, Math.floor(Math.max(0, t - 9.0) / (6.0 / 9)));
  const o = smooth(prog(t, 8.95, 9.3)) * (1 - smooth(prog(t, 17.2, 17.5)));
  const done = t >= 15.0;
  const pop = done ? Math.exp(-(t - 15.0) * 4) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        top: 120,
        right: 70,
        fontFamily: FONT,
        textAlign: 'right',
        opacity: o,
        transform: `scale(${1 + 0.12 * pop})`,
        transformOrigin: '100% 0%',
      }}
    >
      <div style={{fontSize: 26, fontWeight: 500, letterSpacing: '0.3em', color: done ? '#86EFAC' : '#9A9A9A'}}>SPENDA</div>
      <div
        style={{
          fontSize: 132,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.03em',
          color: done ? '#86EFAC' : '#FFFFFF',
          textShadow: done ? '0 0 30px rgba(34,197,94,0.6)' : '0 4px 18px rgba(0,0,0,0.7)',
          lineHeight: 1,
        }}
      >
        00:{String(secs).padStart(2, '0')}
      </div>
    </div>
  );
};
