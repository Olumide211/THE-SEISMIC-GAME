import { loadFont as loadGoogleFont } from "@remotion/google-fonts/AlbertSans";
import { loadFont as loadLocalFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { getStaticFiles } from "@remotion/studio";

// The Spenda app's own typeface can be dropped into public/fonts/ as
//   app-400.(woff2|otf|ttf), app-500.…, app-600.…, app-700.…
// and it's used automatically. Until then we use Albert Sans, the closest
// free match (round O/e, straight-tailed y, geometric proportions).
const LOCAL_FAMILY = "SpendaApp";
const WEIGHTS = ["300", "400", "500", "600", "700"] as const;

const localFiles = (() => {
  try {
    return getStaticFiles().filter((f) => /^fonts\/app-\d{3}\.(woff2|otf|ttf)$/.test(f.name));
  } catch {
    return [];
  }
})();

const google = loadGoogleFont("normal", { weights: [...WEIGHTS], subsets: ["latin", "latin-ext"] });

for (const file of localFiles) {
  const weight = file.name.match(/app-(\d{3})/)![1];
  loadLocalFont({ family: LOCAL_FAMILY, url: staticFile(file.name), weight });
}

export const fontFamily = localFiles.length ? LOCAL_FAMILY : google.fontFamily;
// Local app font first, Albert Sans for any weight it doesn't ship, emoji last.
export const FONT = `${localFiles.length ? `"${LOCAL_FAMILY}", ` : ""}${google.fontFamily}, "Noto Color Emoji", sans-serif`;
