import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/lib/config";
import type { ApiResponse, BlockchainInfo, EVMToken, TokenBalance } from "@/lib/types";

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
  async getTokens(): Promise<ApiResponse<{ tokens: EVMToken[] }>> {
    return apiClient.get<{ tokens: EVMToken[] }>(API_ENDPOINTS.getTokens);
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
