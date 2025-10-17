// Base API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Auth Types
export interface User {
  id: string;
  whatsappNumber: string;
  countryCode: string;
  status: "PENDING_KYC" | "VERIFIED" | "SUSPENDED";
  kycNftTokenId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  whatsappNumber: string;
  countryCode: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Exchange API Types
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export interface ConversionPath {
  from: string;
  to: string;
  path: string[];
  usesMockToken: boolean;
  mockTokens?: {
    hub: string;
    recipient: string;
  };
  policyIds?: Record<string, string>;
}

// Transfer API Types
export interface TransferQuote {
  sender: {
    currency: string;
    amount: number;
    token: string;
  };
  recipient: {
    currency: string;
    amount: number;
    token: string;
  };
  exchangeRate: number;
  fee: {
    percentage: number;
    amount: number;
  };
  total: number;
  timestamp: string;
}

export interface TransferCalculation {
  senderAmount: number;
  senderCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  exchangeRate: number;
  adaAmount: number;
  blockchain: {
    usesMockToken: boolean;
    hubToken: string;
    recipientToken: string;
    path: string[];
    policyIds: Record<string, string>;
  };
  fee: {
    percentage: number;
    amount: number;
  };
  totalAmount: number;
}

export interface TransferRequest {
  whatsappNumber: string;
  paymentMethod: "WALLET" | "MASTERCARD";
  senderCurrency: string;
  senderAmount: number;
  recipientName: string;
  recipientCurrency: string;
  recipientBank: string;
  recipientAccount: string;
  recipientWalletAddress?: string;
  cardDetails?: {
    number: string;
    cvc: string;
    expiry: string;
  };
}

export interface TransferInitiation {
  transferId: string;
  status: string;
  senderAmount: number;
  senderCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  exchangeRate: number;
  fee: number;
  total: number;
  createdAt: string;
}

export interface TransferStatus {
  id: string;
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "cancelled";
  senderAmount: number;
  senderCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  txHash?: string;
  blockchainTxUrl?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BlockchainTransaction {
  step: number;
  action: string;
  amount?: string;
  from?: string;
  to?: string;
  txHash: string;
  cardanoScanUrl: string;
  timestamp: string;
}

export interface TransferDetails {
  id: string;
  userId: number;
  whatsappNumber: string;
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod: "WALLET" | "MASTERCARD";
  senderCurrency: string;
  senderAmount: number;
  senderTokenAddress?: string;
  recipientName: string;
  recipientCurrency: string;
  recipientExpectedAmount: number;
  recipientTokenAddress?: string;
  recipientBank: string;
  recipientAccount: string;
  recipientWalletAddress?: string;
  exchangeRate: number;
  feePercentage: number;
  feeAmount: number;
  totalAmount: number;
  txHash?: string;
  blockchainTxUrl?: string;
  cardEncrypted?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransferHistoryItem {
  id: string;
  userId: number;
  whatsappNumber: string;
  status: "pending" | "paid" | "processing" | "completed" | "failed" | "cancelled";
  paymentMethod: "WALLET" | "MASTERCARD";
  senderCurrency: string;
  senderAmount: number;
  recipientName: string;
  recipientCurrency: string;
  recipientExpectedAmount: number;
  recipientBank: string;
  recipientAccount: string;
  exchangeRate: number;
  feePercentage: number;
  feeAmount: number;
  totalAmount: number;
  txHash?: string;
  blockchainTxUrl?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransferHistory {
  transfers: TransferHistoryItem[];
  count: number;
  limit: number;
  offset: number;
}

// Cardano API Types
export interface CardanoToken {
  id: number;
  token_name: string;
  token_symbol: string;
  policy_id: string;
  asset_unit: string;
  decimals: number;
  total_supply: string;
  deployment_tx_hash: string;
  cardano_network: string;
  description?: string;
  is_active: boolean;
  deployed_at: string;
}

export interface TokenStats {
  totalMints: number;
  totalMintedAmount: string;
  totalSwaps: number;
  lastActivity: string;
}

export interface TokenWithStats {
  token: CardanoToken;
  stats: TokenStats;
}

export interface MintRecord {
  id: number;
  token_id: number;
  amount: string;
  recipient_address: string;
  tx_hash: string;
  cardano_scan_url: string;
  redeemer_data?: string;
  created_at: string;
}

export interface SwapRecord {
  id: number;
  from_token_id: number;
  to_token_id: number;
  from_amount: string;
  to_amount: string;
  exchange_rate: number;
  sender_address: string;
  recipient_address: string;
  tx_hash: string;
  cardano_scan_url: string;
  swap_type: "DIRECT" | "HUB";
  hub_token_id?: number;
  created_at: string;
}

export interface BackendWalletInfo {
  address: string;
  publicKeyHash: string;
  balance: {
    ada: number;
    lovelace: string;
    assets: Array<{
      unit: string;
      quantity: string;
    }>;
  };
  isReady: boolean;
}

export interface ScriptUtxo {
  txHash: string;
  outputIndex: number;
  amount: Array<{
    unit: string;
    quantity: string;
  }>;
  datum?: string;
}

export interface TransactionStatus {
  transactionHash: string;
  confirmed: boolean;
}

// EVM/Base Sepolia Types
export interface EVMToken {
  id: number;
  tokenSymbol: string;
  tokenName: string;
  contractAddress: string;
  decimals: number;
  network: string;
  chainId: number;
  isActive: boolean;
  deploymentTxHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainInfo {
  network: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenBalance {
  token: string;
  balance: string;
  decimals: number;
  formattedBalance: string;
}
