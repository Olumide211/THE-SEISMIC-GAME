// All timing in one place. Authored in seconds, converted to frames at 25fps.
export const FPS = 25;
export const DURATION = 550; // 22s
export const f = (seconds: number) => Math.round(seconds * FPS);

type Span = { from: number; to: number };
const span = (a: number, b: number): Span => ({ from: f(a), to: f(b) });
export const dur = (s: Span) => s.to - s.from;

export const scenes = {
  s1: span(0, 1.2), // "Dear P2P vendor,"
  s2: span(1.2, 4.4), // chat breakup
  s3: span(4.4, 5.4), // "It's not you. It's the waiting."
  s4: span(5.4, 6.4), // shatter + "We're done."
  s5: span(6.4, 8.96), // Meet Spenda 2.0 (closes the 8.90–8.95 gap)
  s6: span(8.96, 10.4), // open Spenda
  s7: span(10.4, 12.0), // tap Deposit
  s8: span(12.0, 13.4), // deposit sheet + credit
  s9: span(13.4, 15.4), // convert
  s10: span(15.4, 16.4), // press convert / spinner
  s11: span(16.4, 17.5), // success + split
  s12: span(17.5, 19.3), // done in seconds + confetti
  s13: span(19.3, 22.0), // end card
};

// Studio (white bg) + phone layer covers S6–S11; particles 9.0s–17.5s.
export const studio = { from: scenes.s6.from, to: scenes.s11.to };
export const particles = span(9.0, 17.5);

// Absolute event times (frames).
export const t = {
  // S1
  dearType: f(0.08),
  // S2
  phoneRise: f(1.2),
  msg1: f(1.4),
  typing1: [f(1.6), f(2.0)] as const,
  msg2: f(2.0),
  msg3: f(2.5),
  typing2: [f(2.8), f(3.6)] as const,
  msg4: f(3.6),
  shake: f(4.1),
  // S3
  notYou: f(4.45),
  waiting: f(4.85),
  // S4
  shatter: f(5.5),
  doneType: f(5.66),
  // S5
  meet: f(6.45),
  spenda: f(7.1),
  twoPoint: f(7.45),
  split: f(7.7),
  iconDraw: f(8.0),
  iconFill: f(8.42),
  // S6
  splash: f(8.96),
  homeIn: f(9.62),
  // S7
  dolly: f(10.4),
  tapDeposit: f(10.9),
  // S8
  sheetUp: f(12.0),
  highlight: f(12.3),
  tapCopy: f(12.6),
  cashBanner: f(12.9),
  tapDismiss: f(13.0),
  balanceRoll: [f(13.0), f(13.4)] as const,
  // S9
  wipe: f(13.4),
  typeStart: f(13.85),
  framesPerDigit: 3,
  swapSpin: f(14.35),
  coins: f(14.5),
  // S10
  pressConvert: f(15.5),
  spinner: [f(15.62), f(16.4)] as const,
  // S11
  success: f(16.4),
  split11: f(16.5),
  // S12
  checkPop: f(17.5),
  checkDraw: f(17.62),
  confetti: f(18.0),
  // S13
  morph: f(19.3),
  slideLeft: f(20.0),
  tagline: f(20.6),
  hashtag: f(20.85),
  fadeOut: DURATION - 12,
};

// Optional SFX (skipped silently if the file is missing in /public).
export const sfx: { file: string; at: number; volume?: number }[] = [
  { file: "message.mp3", at: t.msg1 },
  { file: "message.mp3", at: t.msg2 },
  { file: "message.mp3", at: t.msg3 },
  { file: "message.mp3", at: t.msg4 },
  ...[scenes.s3.from, scenes.s4.from, scenes.s5.from, scenes.s6.from, scenes.s12.from].map(
    (at) => ({ file: "whoosh.mp3", at }),
  ),
  { file: "shatter.mp3", at: t.shatter },
  ...[f(10.9), f(12.6), f(13.0), f(15.5)].map((at) => ({ file: "click.mp3", at })),
  { file: "cash.mp3", at: f(12.9) },
  { file: "pop.mp3", at: f(17.6) },
];
