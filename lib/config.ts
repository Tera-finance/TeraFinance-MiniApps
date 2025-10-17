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

  // Transfers
  calculateTransfer: "/api/transfer/calculate",
  initiateTransfer: "/api/transfer/initiate",
  getTransferDetails: (id: string) => `/api/transfer/details/${id}`,
  getTransferStatus: (id: string) => `/api/transfer/status/${id}`,
  confirmTransfer: "/api/transfer/confirm",
  getTransactionHistory: "/api/transactions/history",
  getInvoice: (id: string) => `/api/transfer/invoice/${id}`,

  // Exchange
  getCurrencies: "/api/exchange/currencies",
  getExchangeRate: "/api/exchange/rate",
  getConversionPath: "/api/exchange/path",

  // Base Blockchain (EVM)
  getWalletBalance: "/api/base/wallet/balance",
  getTokenBalance: (address: string, tokenAddress: string) =>
    `/api/base/wallet/${address}/token/${tokenAddress}`,
  getTransactionStatus: (txHash: string) =>
    `/api/base/transaction/${txHash}/status`,
  getWalletTransactionHistory: (address: string) =>
    `/api/base/wallet/${address}/transactions`,
};

export const SUPPORTED_CURRENCIES = {
  CRYPTO: [
    "USDC",
    "USDT",
    "DAI",
    "ETH",
  ],
  FIAT: [
    "USD",
    "EUR",
    "GBP",
    "IDR",
    "JPY",
    "CNY",
    "MXN",
    "PHP",
    "INR",
    "THB",
    "SGD",
    "MYR",
    "AUD",
    "CAD",
    "BND",
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

// Base Sepolia Token Addresses
export const TOKEN_ADDRESSES = {
  USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia USDC
  // Add more token addresses as needed
} as const;
