// All brand values live here. Colors are placeholders — swap for real Spenda colors.
// (Observed in the live app: near-black #000000 surfaces, navy #1B3A5E tabs,
//  success green #1FC877.)
export const brand = {
  name: "Spenda",
  version: "2.0",
  colors: {
    darkBg: "#0E0E10",
    lightBg: "#FAFAFA",
    primary: "#5B3DF5",
    primaryDark: "#4127D6",
    primaryLight: "#8A73FF",
    accent: "#C6F432",
    stablecoin: "#26A17B",
    danger: "#E5484D",
    chatGray: "#E9E9EB",
    textDark: "#1F1F1F",
    textMid: "#333333",
    textMuted: "#8A8A8E",
    hairline: "#ECECEF",
    naira: "#1E8E3E",
  },
  gradient: "linear-gradient(135deg, #8A73FF 0%, #5B3DF5 50%, #3B21C7 100%)",
  gradientStops: ["#8A73FF", "#5B3DF5", "#3B21C7"] as const,

  userName: "Breeze",
  bankName: "Partner Bank MFB",
  accountNumber: "0123456789",
  vendorName: "P2P Vendor 🔥",

  rate: 1357, // ₦ per 1 USDT
  depositAmount: 50000, // ₦
  stableSymbol: "USDT",

  tagline: "Bye bye P2P wahala 👋",
  hashtag: "#MySpenda",
  handle: "@myspenda",
};

export const toAmount = brand.depositAmount / brand.rate; // ≈ 36.85 USDT

export const fmtNaira = (n: number, decimals = 0) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
