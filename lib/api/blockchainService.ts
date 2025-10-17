import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/lib/config";
import type { ApiResponse, BlockchainInfo, TokenBalance } from "@/lib/types";

interface TokensResponse {
  tokens: Record<string, string>; // { usdc: "0x...", idrx: "0x..." }
  contracts: {
    remittanceSwap: string;
    multiTokenSwap: string;
  };
}

class BlockchainService {
  /**
   * Get blockchain network information (Base Sepolia)
   */
  async getBlockchainInfo(): Promise<ApiResponse<BlockchainInfo>> {
    return apiClient.get<BlockchainInfo>(API_ENDPOINTS.getBlockchainInfo);
  }

  /**
   * Get all available ERC20 tokens on Base Sepolia
   */
  async getTokens(): Promise<ApiResponse<TokensResponse>> {
    return apiClient.get<TokensResponse>(API_ENDPOINTS.getTokens);
  }

  /**
   * Get token balance for a specific token address
   * @param tokenAddress - The ERC20 token contract address
   */
  async getTokenBalance(tokenAddress: string): Promise<ApiResponse<TokenBalance>> {
    return apiClient.get<TokenBalance>(
      API_ENDPOINTS.getTokenBalance(tokenAddress),
      true // Requires authentication
    );
  }
}

export const blockchainService = new BlockchainService();
