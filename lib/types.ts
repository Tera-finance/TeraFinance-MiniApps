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
  paymentMethod: string;
  senderCurrency: string;
  senderAmount: number;
  recipientName: string;
  recipientCurrency: string;
  recipientBank: string;
  recipientAccount: string;
  cardDetails?: {
    number: string;
    cvc: string;
    expiry: string;
  };
}

export interface TransferInitiation {
  transferId: string;
  status: string;
  message: string;
  estimatedCompletion: string;
  paymentLink?: string;
}

export interface TransferStatus {
  transferId: string;
  status:
    | "INITIATED"
    | "PAYMENT_CONFIRMED"
    | "MINTED_MOCKADA"
    | "SWAPPED_TO_RECIPIENT_TOKEN"
    | "BANK_PAYOUT_INITIATED"
    | "COMPLETED"
    | "FAILED";
  message: string;
  timestamp: string;
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
  transferId: string;
  status: string;
  paymentMethod: string;
  sender: {
    currency: string;
    amount: number;
    symbol: string;
    totalCharged: number;
  };
  recipient: {
    name: string;
    currency: string;
    amount: number;
    symbol: string;
    bank: string;
    account: string;
  };
  blockchain: {
    path: string[];
    mockADAAmount: number;
    hubToken: string;
    recipientToken: string;
    policyIds: Record<string, string>;
    transactions: BlockchainTransaction[];
  };
  fees: {
    percentage: number;
    amount: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export interface TransferHistoryItem {
  transferId: string;
  status: string;
  paymentMethod: string;
  sender: {
    currency: string;
    amount: number;
    symbol: string;
  };
  recipient: {
    name: string;
    currency: string;
    amount: number;
    symbol: string;
    bank: string;
    account: string;
  };
  blockchain: {
    path: string[];
    mockADAAmount: number;
    hubToken: string;
    recipientToken?: string;
    txHash: string;
    cardanoScanUrl: string;
    policyIds: Record<string, string>;
  };
  fees: {
    percentage: number;
    amount: number;
  };
  createdAt: string;
  completedAt?: string;
}

export interface TransferHistory {
  transfers: TransferHistoryItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
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
