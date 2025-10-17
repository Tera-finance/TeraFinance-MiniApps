export const config = {
  backendApiUrl:
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://api-trustbridge.izcy.tech",
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
  // Base Sepolia Network Configuration
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "84532"),
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org",
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://sepolia.basescan.org",
};

export const API_ENDPOINTS = {
  // Auth
  login: "/api/auth/login",
  register: "/api/auth/register",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  getMe: "/api/auth/me",

  // Transfers
  initiateTransfer: "/api/transfer/initiate",
  getTransferDetails: (id: string) => `/api/transfer/${id}`,
  getTransferStatus: (id: string) => `/api/transfer/status/${id}`,
  getTransferHistory: "/api/transfer/history",
  getPendingTransfers: "/api/transfer/pending",
  getInvoice: (id: string) => `/api/transfer/invoice/${id}`,

  // Exchange
  getCurrencies: "/api/exchange/currencies",
  getExchangeRate: "/api/exchange/rate",
  getAllRates: "/api/exchange/rates",
  getQuote: "/api/exchange/quote",
  convertAmount: "/api/exchange/convert",

  // Blockchain (Base Sepolia)
  getBlockchainInfo: "/api/blockchain/info",
  getTokens: "/api/blockchain/tokens",
  getTokenBalance: (tokenAddress: string) => `/api/blockchain/balance/${tokenAddress}`,
};

export const SUPPORTED_CURRENCIES = {
  CRYPTO: [
    "USDC",
    "IDRX",
    "CNHT",
    "EUROC",
    "JPYC",
    "MXNT",
  ],
  FIAT: [
    "USD",
    "IDR",
    "CNH",
    "EUR",
    "JPY",
    "MXN",
  ],
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  // Fiat Currencies
  USD: "$",
  EUR: "€",
  GBP: "£",
  IDR: "Rp",
  JPY: "¥",
  CNY: "¥",
  MXN: "$",
  PHP: "₱",
  INR: "₹",
  THB: "฿",
  SGD: "S$",
  MYR: "RM",
  AUD: "A$",
  CAD: "C$",
  BND: "B$",
  // Crypto Currencies
  ETH: "Ξ",
  USDC: "$",
  USDT: "$",
  DAI: "◈",
};

// Base Sepolia Token Addresses (from Tera-Backend)
export const TOKEN_ADDRESSES = {
  USDC: "0x886664e1707b8e013a4242ee0dbfe753c68bf7d4",
  IDRX: "0x67cacfe96ca874ec7a78ee0d6f7044e878ba9c4c",
  CNHT: "0x993f00d791509cfab774e3b97dab1f0470ffc9cf",
  EUROC: "0x76c9d8f6eb862d4582784d7e2848872f83a64c1b",
  JPYC: "0x5246818cdeccf2a5a08267f27ad76dce8239eaec",
  MXNT: "0x83d1214238dd4323bd165170cf9761a4718ae1db",
} as const;

// Smart Contract Addresses
export const CONTRACT_ADDRESSES = {
  REMITTANCE_SWAP: "0x9354839fba186309fd2c32626e424361f57233d2",
  MULTI_TOKEN_SWAP: "0x2c7f17bc795be548a0b1da28d536d57f78df0543",
} as const;
