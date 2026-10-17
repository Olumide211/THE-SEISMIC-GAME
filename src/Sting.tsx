import React from 'react';
import {AbsoluteFill} from 'remotion';
import {backOut, clamp01, easeInOut, easeOut, expoOut, lerp, prog, smooth} from './engine/kit';
import {LEAF_BOTTOM, LEAF_TOP} from './ui/Logo';
import {FONT} from './ui/theme';

const MARK_H = 128;
const MARK_W = (MARK_H * 90) / 124;
const WORD_W = 470;

/* Shots 16-17 (22.5-25.2s): the two ribbon leaves of the S spin in and lock (shimmer at
   ~23.0), "Spenda" slides out to the right, tagline below, then the editor credit. */
export const Sting: React.FC<{t: number; shift?: number; tagline?: string | null; fadeEnd?: number; ui?: number}> = ({t: tg, shift = 0, tagline = 'Naira in. Stablecoins out.', fadeEnd, ui = 1}) => {
  // all beats are authored on the launch film's clock; `shift` moves the whole sting
  const t = tg - shift;
  if (t < 22.4) return null;
  const lock = expoOut(prog(t, 22.5, 23.0));
  const lockSoft = easeOut(prog(t, 22.5, 23.05));
  const word = easeInOut(prog(t, 23.1, 23.75));
  const tag = smooth(prog(t, 23.6, 24.15));
  const line = expoOut(prog(t, 24.15, 24.75));
  const cr1 = smooth(prog(t, 24.3, 24.7));
  const cr2 = smooth(prog(t, 24.42, 24.85));
  const fadeOut = fadeEnd !== undefined ? 1 - smooth(prog(tg, fadeEnd - 0.25, fadeEnd)) : 1 - smooth(prog(t, 25.0, 25.2));
  // shimmer: a light band sweeps across the mark at lock, then across the wordmark
  const sweep = lerp(-0.6, 1.6, easeInOut(prog(t, 22.92, 23.4)));
  const sweepWord = lerp(-0.4, 1.4, easeInOut(prog(t, 23.55, 24.2)));
  const flash = Math.exp(-Math.max(0, t - 22.98) * 6) * (t > 22.98 ? 1 : 0);

  const leaf = (d: string, from: {x: number; y: number; rz: number; ry: number}) => {
    const k = 1 - lock;
    const ks = 1 - lockSoft;
    return (
      <svg
        width={MARK_W}
        height={MARK_H}
        viewBox="0 0 90 124"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          transform: `translate(${from.x * k}px, ${from.y * k}px) rotateZ(${from.rz * ks}deg) rotateY(${from.ry * ks}deg) scale(${lerp(0.6, 1, lockSoft)})`,
          transformOrigin: '50% 50%',
          opacity: clamp01(prog(t, 22.5, 22.62)),
        }}
      >
        <defs>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset={sweep - 0.25} stopColor="#E9E9E9" />
            <stop offset={sweep} stopColor="#FFFFFF" />
            <stop offset={sweep + 0.25} stopColor="#E9E9E9" />
          </linearGradient>
        </defs>
        <path d={d} fill="url(#shine)" />
      </svg>
    );
  };

  return (
    <AbsoluteFill style={{opacity: fadeOut, fontFamily: FONT}}>
      {/* lockup */}
      <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 60}}>
        <div style={{display: 'flex', alignItems: 'center', transform: `scale(${ui})`}}>
          <div
            style={{
              position: 'relative',
              width: MARK_W,
              height: MARK_H,
              perspective: 600,
              filter: `drop-shadow(0 0 ${14 + 30 * flash}px rgba(255,255,255,${0.35 + 0.5 * flash}))`,
            }}
          >
            {leaf(LEAF_TOP, {x: 240, y: -170, rz: -220, ry: 75})}
            {leaf(LEAF_BOTTOM, {x: -240, y: 170, rz: 200, ry: -75})}
          </div>
          <div style={{width: lerp(0, WORD_W + 30, word), overflow: 'hidden', height: MARK_H * 1.3, display: 'flex', alignItems: 'center'}}>
            <div
              style={{
                marginLeft: 30,
                fontSize: 128,
                fontWeight: 600,
                letterSpacing: '-0.045em',
                lineHeight: 1,
                whiteSpace: 'nowrap',
                transform: `translateX(${lerp(-WORD_W * 0.6, 0, word)}px)`,
                opacity: word,
                backgroundImage: `linear-gradient(100deg, #EDEDED ${(sweepWord - 0.15) * 100}%, #FFFFFF ${sweepWord * 100}%, #EDEDED ${(sweepWord + 0.15) * 100}%)`,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.3))',
                paddingBottom: 12,
              }}
            >
              Spenda
            </div>
          </div>
        </div>
      </AbsoluteFill>
      {/* tagline */}
      {tagline && <AbsoluteFill style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div
          style={{
            marginTop: 190,
            fontSize: 36,
            fontWeight: 400,
            color: '#C9C9C9',
            letterSpacing: '0.01em',
            opacity: tag,
            transform: `translateY(${lerp(18, 0, tag)}px)`,
          }}
        >
          {tagline}
        </div>
      </AbsoluteFill>}
      {/* credit */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 92 * ui, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${ui})`, transformOrigin: '50% 100%'}}>
        <div style={{width: 260, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9), rgba(255,255,255,0))', transform: `scaleX(${line})`, opacity: line > 0 ? 1 : 0}} />
        <div style={{marginTop: 18, fontSize: 15, letterSpacing: '0.42em', color: '#8A8A8A', fontWeight: 500, opacity: cr1, paddingLeft: '0.42em'}}>EDITED BY</div>
        <div style={{marginTop: 8, fontSize: 32, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em', opacity: cr2, transform: `translateY(${lerp(8, 0, cr2)}px)`}}>BreezeOg</div>
      </div>
    </AbsoluteFill>
  );
};
