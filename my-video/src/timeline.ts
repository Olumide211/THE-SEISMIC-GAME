// All timing for the video, in seconds from the start of the video.
// Scenes read absolute times from here, so moving a beat means editing one number.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_S = 12;
export const DURATION_FRAMES = DURATION_S * FPS;

export const sec = (s: number) => Math.round(s * FPS);

export const T = {
  // 0.0-1.0  Glowing sphere -> "Instant ✓" -> dot
  intro: {
    start: 0,
    end: 1.0,
    sphereIn: [0.0, 0.3],
    accentStreak: [0.04, 0.3],
    // Second glowing sphere that trails up under the word (reference 0.5s)
    trailSphere: [0.3, 0.68],
    wordIn: [0.24, 0.46],
    checkDraw: [0.3, 0.46],
    dotOut: [0.7, 0.9],
  },

  // 1.0-2.05  Swoosh, s-p-e-n-d-a flashes, word, app icon, black -> white
  letters: {
    start: 1.0,
    end: 2.05,
    streak: [1.0, 1.14],
    flashStart: 1.1,
    flashStep: 0.055,
    assemble: 1.44,
    assembleStagger: 0.022,
    iconMorph: [1.62, 1.8],
    bgSnap: 1.82,
    iconPop: 1.82,
  },

  // 2.05-4.45  Icon -> pill -> "Deposit Naira" -> convert panel -> cursor click
  pill: {
    start: 2.05,
    end: 4.45,
    toPill: [2.05, 2.3],
    toLight: [2.38, 2.58],
    toPanel: [3.18, 3.45],
    headerIn: 3.28,
    cycleSwaps: [3.56, 3.76],
    cursorIn: [3.78, 4.1],
    click: 4.14,
  },

  // 4.45-6.0  Row -> big conversion card, 3D coin, button click, swoosh loader
  card: {
    start: 4.45,
    end: 6.0,
    morph: [4.45, 4.78],
    contentIn: 4.54,
    coinDrop: 4.78,
    coinFlip: [4.78, 5.65],
    cursorIn: [5.08, 5.42],
    click: 5.46,
    loader: 5.5,
    zoom: [4.45, 6.0],
    // The card scene overlaps the progress scene while the card collapses.
    collapseEnd: 6.2,
  },

  // 6.0-8.0  Card collapses (3D tilt) -> "Converting…" pill -> progress -> complete
  progress: {
    start: 6.0,
    end: 8.0,
    collapse: [6.0, 6.5],
    tiltPeak: 6.72,
    tiltSettle: 7.32,
    fill: [6.72, 7.58],
    complete: 7.62,
  },

  // 8.0-12.0  "received" morph, zoom into white, black, P2P glitch -> wordmark
  outro: {
    start: 8.0,
    end: 12.0,
    received: [8.15, 8.42],
    zoom: [8.95, 9.48],
    toBlack: [9.62, 10.02],
    glitch: [10.58, 10.86],
    tagline: 10.95,
  },

  audio: {
    musicFadeOut: 0.5,
  },
} as const;
