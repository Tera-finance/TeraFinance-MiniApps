import { apiClient } from "./apiClient";
import { API_ENDPOINTS, config } from "@/lib/config";
import type {
  ApiResponse,
  TransferRequest,
  TransferInitiation,
  TransferStatus,
  TransferDetails,
  TransferHistory,
} from "@/lib/types";

class TransferService {
  /**
   * Initiate a new transfer
   */
  async initiateTransfer(
    transferData: TransferRequest
  ): Promise<ApiResponse<TransferInitiation>> {
    return apiClient.post<TransferInitiation>(
      API_ENDPOINTS.initiateTransfer,
      transferData,
      true // Requires authentication
    );
  }

  /**
   * Get transfer status by ID
   */
  async getTransferStatus(transferId: string): Promise<ApiResponse<TransferStatus>> {
    return apiClient.get<TransferStatus>(
      API_ENDPOINTS.getTransferStatus(transferId),
      true
    );
  }

  /**
   * Get full transfer details by ID
   */
  async getTransferDetails(transferId: string): Promise<ApiResponse<TransferDetails>> {
    return apiClient.get<TransferDetails>(
      API_ENDPOINTS.getTransferDetails(transferId),
      true
    );
  }

  /**
   * Get transfer history for the authenticated user
   */
  async getTransferHistory(
    limit: number = 20,
    offset: number = 0
  ): Promise<ApiResponse<TransferHistory>> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    const endpoint = `${API_ENDPOINTS.getTransferHistory}?${params.toString()}`;
    return apiClient.get<TransferHistory>(endpoint, true);
  }

  /**
   * Get pending transfers for the authenticated user
   */
  async getPendingTransfers(): Promise<ApiResponse<{ transfers: TransferDetails[]; count: number }>> {
    return apiClient.get<{ transfers: TransferDetails[]; count: number }>(
      API_ENDPOINTS.getPendingTransfers,
      true
    );
  }

  /**
   * Download PDF invoice for a transfer
   */
  async downloadInvoice(transferId: string): Promise<Blob> {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${config.backendApiUrl}${API_ENDPOINTS.getInvoice(transferId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download invoice");
    }

    return response.blob();
  }

  /**
   * Submit wallet transfer with transaction hash (after user signs)
   */
  async submitWalletTransfer(data: {
    whatsappNumber: string;
    senderCurrency: string;
    senderAmount: number;
    recipientName: string;
    recipientCurrency: string;
    recipientBank: string;
    recipientAccount: string;
    txHash: string;
    tokenInAddress: string;
    tokenOutAddress: string;
  }): Promise<ApiResponse<TransferInitiation>> {
    return apiClient.post<TransferInitiation>(
      "/api/transfer/wallet-submit",
      data,
      true // Requires authentication
    );
  }
}

export const transferService = new TransferService();
