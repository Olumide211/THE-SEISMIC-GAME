// All brand values live here. Colors are sampled from the live Spenda app.
export const brand = {
  name: "Spenda",
  colors: {
    white: "#FFFFFF",
    darkBg: "#0B0B0C",
    ink: "#0A0A0A", // primary text / buttons
    card: "#000000", // balance card
    cardTile: "#111111", // faint tiles on the card
    cardButton: "#262626", // Deposit / Transfer on the card
    muted: "#6E6E73",
    hairline: "#E9E9EB",
    navy: "#1B3A5E", // selected tabs
    navyTint: "#EBF4FD", // info boxes
    navyBorder: "#BCD6EE",
    moneyIn: "#5DA82A", // "+ ₦1,338.48"
    success: "#1FC877", // "Transfer sent" ring
    danger: "#E5484D",
    chatGray: "#E9E9EB",
    studio: "#F4F4F6",
    tether: "#26A17B",
  },
  quickActions: {
    airtime: { bg: "#E6F6FD", border: "#9ED6EF", icon: "#0B5E8E" },
    data: { bg: "#FDF1E7", border: "#F5C9A4", icon: "#7A3A0A" },
    bills: { bg: "#EFF6EA", border: "#C6DDB7", icon: "#2F4A1E" },
    rewards: { bg: "#EEF4FB", border: "#C3D8EE", icon: "#1B3A5E" },
  },

  userName: "Breeze",
  vendorName: "P2P Vendor 🔥",
  userId: "10293847",

  // crypto → Naira
  coin: "USDT",
  network: "TRC20",
  walletAddress: "TQ7xR2mVb8Lk4Nn5pWc9Ys3Hd6Jf1Ze9fK2",
  sendAmount: 50, // USDT
  rate: 1357, // ₦ per $1
  feePct: 0.9, // %

  // spend it
  transferAmount: 45000,
  recipient: "Chidi Okafor",
  recipientBank: "GTBank",
  recipientAccount: "0123456789",

  tagline: "Bye bye P2P wahala 👋",
};

export const feeUsd = (brand.sendAmount * brand.feePct) / 100; // $0.45
export const receiveNaira = (brand.sendAmount - feeUsd) * brand.rate; // ₦67,239.35

export const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
