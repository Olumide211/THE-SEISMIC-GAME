// Every brand value lives here: name, colors, data and copy.

export const brand = {
  name: "Spenda",
  version: "2.0",
  credit: "Edited by BreezeOg",

  colors: {
    black: "#000000",
    white: "#FFFFFF",
    field: "#F2F2F2",
    muted: "#8A8A8A",
    border: "#E2E2E2",
    canvas: "#FFFFFF",
    ink: "#0A0A0A",
    darkCard: "#1C1C1C",
    darkField: "#262626",
    // Only for success and USDT moments.
    success: "#22C55E",
    successDeep: "#15803D",
    usdtLight: "#4ADE80",
    // Chat scene only.
    seenRed: "#FF3B30",
    // Backdrop behind Spenda's real bottom sheet.
    sheetBackdrop: "#B9BAB5",
  },

  radius: {
    button: 16,
  },

  // Placeholder data only.
  data: {
    user: "Breeze",
    maskedBalance: "₦ ••••••",
    ngn: 50000,
    rate: 1357,
    feeNgn: 0,
  },

  copy: {
    chatTitle: "P2P Vendor",
    chat: {
      me1: "Sent ₦50k 🙏",
      vendor1: "Send screenshot",
      me2: "Sent",
      seen: "Seen 40 mins ago",
    },
    kinetic1: ["No more", "waiting."],
    deposit: "Deposit Naira",
    convertHeader: "Convert",
    cardTitle: "Your Conversion",
    cardSubtitle: "Naira in. Stablecoins out.",
    button: "Convert Now",
    converting: "Converting…",
    convertingSub: "No vendor. No screenshots.",
    success: "Transfer sent",
    viewReceipt: "View Receipt",
    done: "Done",
    captions: {
      home: "Naira + stablecoins.\nOne app.",
      statement: "Statements\nin one tap.",
      security: "Dark mode. 2FA.\nLocked in.",
    },
    kinetic2: ["Faster.", "Safer.", "Spenda."],
    oldWay: "P2P",
    tagline: "Bye bye P2P wahala.",
  },
} as const;

const ngnFormatter = new Intl.NumberFormat("en-US");

export const formatNgn = (n: number) => `₦${ngnFormatter.format(n)}`;
export const formatNgnPlain = (n: number) => ngnFormatter.format(n);

export const usdtAmount = () =>
  ((brand.data.ngn - brand.data.feeNgn) / brand.data.rate).toFixed(2);
