// All timing, in seconds from the start of the video.
// Hard cuts are listed in BEATS so they line up with the music's beat grid.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_FRAMES = 600;
export const DURATION_S = DURATION_FRAMES / FPS;

export const sec = (s: number) => Math.round(s * FPS);

export const T = {
  // S1 0.0-2.2 The problem: P2P vendor chat
  s1: {
    start: 0,
    end: 2.2,
    header: 0.05,
    bubbles: [0.3, 0.62, 0.95],
    typing: [1.2, 1.6],
    seen: 1.62,
    clockIn: 0.8,
    shake: [2.0, 2.2],
  },

  // S2 2.2-3.2 Kinetic break
  s2: { start: 2.2, end: 3.2, cuts: [2.2, 2.7] },

  // S3 3.2-4.6 Logo reveal
  s3: {
    start: 3.2,
    end: 4.6,
    sphere: [3.2, 3.48],
    unfold: [3.4, 3.62],
    draw: [3.36, 3.6],
    fill: [3.52, 3.66],
    pop: 3.6,
    slideLeft: [3.86, 4.12],
    wordWipe: [3.9, 4.2],
    version: 4.14,
    glint: [4.22, 4.56],
  },

  // S4 4.6-8.4 The flow: pills and cards on white
  s4: {
    start: 4.6,
    end: 8.4,
    iconPop: 4.6,
    toPill: [4.78, 5.06],
    toCard: [5.42, 5.72],
    cursor1: [5.82, 6.18],
    tap1: 6.22,
    toBig: [6.5, 6.86],
    contentIn: 6.52,
    coinIn: [6.72, 7.05],
    coinSpin: [6.72, 7.55],
    cursor2: [7.58, 7.94],
    tap2: 7.98,
    loader: 8.04,
  },

  // S5 8.4-10.0 Processing -> success sheet
  s5: {
    start: 8.4,
    end: 10.0,
    collapse: [8.4, 8.72],
    tiltPeak: 8.62,
    tiltSettle: 9.08,
    fill: [8.72, 9.32],
    toSheet: [9.36, 9.62],
    ringDraw: [9.4, 9.6],
    checkDraw: [9.52, 9.7],
    textIn: 9.5,
    confetti: 9.56,
  },

  // S6 10.0-16.2 3D phone feature montage
  s6: {
    start: 10.0,
    end: 16.2,
    intro: [10.0, 10.5],
    homeBuild: 10.5,
    homeCaption: 10.6,
    flip: [12.0, 12.45],
    statementBuild: 12.3,
    statementCaption: 12.45,
    downloadTap: 13.15,
    pdfFly: [13.2, 13.75],
    slide: [14.0, 14.4],
    securityBuild: 14.15,
    securityCaption: 14.4,
    darkToggle: 14.75,
    tfaToggle: 15.35,
    lockSnap: 15.45,
    zoomOut: [15.95, 16.2],
  },

  // S7 16.2-17.4 Kinetic break
  s7: { start: 16.2, end: 17.4, cuts: [16.2, 16.6, 17.0] },

  // S8 17.4-20.0 Outro
  s8: {
    start: 17.4,
    end: 20.0,
    glitch: [17.5, 17.8],
    shatter: [17.78, 18.15],
    logoIn: [17.82, 18.12],
    glint: [18.3, 18.72],
    tagline: 18.3,
    creditType: [18.6, 19.05],
    caretOut: [19.35, 19.55],
    // Everything is still for the final 10 frames.
    freeze: (DURATION_FRAMES - 10) / FPS,
  },
} as const;

// Every hard cut, on the beat.
export const BEATS = [T.s2.cuts[0], T.s2.cuts[1], T.s3.start, T.s4.start, T.s6.start, ...T.s7.cuts, T.s8.start];

export const AUDIO = {
  musicVolume: 0.8,
  musicFadeOut: 0.6,
  riserAt: 2.6,
  impactAt: T.s3.pop,
  glitchAt: T.s8.glitch[0],
} as const;
