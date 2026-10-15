// Every brand value (name, colors, amounts, rate, copy) lives here.
// Change something in this file and every scene picks it up.

export const brand = {
  name: "Spenda",
  version: "2.0",
  handle: "@myspenda",
  hashtag: "#MySpenda",

  colors: {
    // Main accent: the deep navy used on Spenda's active tabs.
    // It replaces the black that the reference used for buttons and icons.
    brand: "#1A3A5C",
    brandPressed: "#4E6680",
    black: "#000000",
    white: "#FFFFFF",
    canvas: "#FAFAFA",
    pill: "#EEEEEE",
    panel: "#ECECEC",
    pressed: "#8F8B8D",
    field: "#FFFFFF",
    border: "#DCDCDC",
    text: "#0B0B0B",
    muted: "#8C8C8C",
    faint: "#BDBDBD",
    loading: "#0F5BB5",
    success: "#22A55B",
    naira: "#1E9A52",
    nairaDeep: "#0C5E31",
    usdt: "#26A17B",
    usdtDeep: "#11664C",
  },

  // Conversion numbers. The rate comes from the Spenda rates screen.
  amounts: {
    ngn: 50000,
    rate: 1357,
    feeNgn: 0,
    // Amounts the convert row flicks through before it lands on `ngn`.
    cycle: [10000, 25000, 50000],
  },

  copy: {
    intro: "Instant",
    deposit: "Deposit Naira",
    convertHeader: "Convert",
    cardTitle: "Your Conversion",
    cardSubtitle: "Naira in. Stablecoins out.",
    fromLabel: "From",
    toLabel: "To",
    button: "Convert Now",
    converting: "Converting…",
    convertingSub: "No vendor. No screenshots.",
    complete: "Conversion Complete",
    receivedSub: "Straight to your wallet",
    oldWay: "P2P",
    tagline: "Bye bye P2P wahala",
  },
} as const;

const ngnFormatter = new Intl.NumberFormat("en-US");

export const formatNgn = (n: number) => `₦${ngnFormatter.format(n)}`;

export const usdtAmount = (ngn: number = brand.amounts.ngn) =>
  ((ngn - brand.amounts.feeNgn) / brand.amounts.rate).toFixed(2);
