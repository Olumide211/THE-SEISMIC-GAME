import { loadFont } from "@remotion/google-fonts/Outfit";

// Outfit is the closest free match to the geometric sans used in the Spenda app.
export const { fontFamily } = loadFont("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

export const FONT = `${fontFamily}, "Noto Color Emoji", sans-serif`;
