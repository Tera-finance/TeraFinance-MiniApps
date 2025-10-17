import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  ApiResponse,
  TransferCalculation,
  TransferRequest,
  TransferInitiation,
  TransferStatus,
  TransferDetails,
  TransferHistory,
} from "@/lib/types";

class TransferService {
  async calculateTransfer(
    paymentMethod: string,
    senderCurrency: string,
    senderAmount: number,
    recipientCurrency: string
  ): Promise<ApiResponse<TransferCalculation>> {
    return apiClient.post<TransferCalculation>(API_ENDPOINTS.calculateTransfer, {
      paymentMethod,
      senderCurrency,
      senderAmount,
      recipientCurrency,
    });
  }

  async initiateTransfer(
    transferData: TransferRequest
  ): Promise<ApiResponse<TransferInitiation>> {
    return apiClient.post<TransferInitiation>(
      API_ENDPOINTS.initiateTransfer,
      transferData,
      true // Requires authentication
    );
  }

  async confirmPayment(
    transferId: string,
    txHash: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.confirmTransfer,
      {
        transferId,
        txHash,
      },
      true
    );
  }

  async getTransferStatus(transferId: string): Promise<ApiResponse<TransferStatus>> {
    return apiClient.get<TransferStatus>(
      API_ENDPOINTS.getTransferStatus(transferId),
      true
    );
  }

  async getTransferDetails(transferId: string): Promise<ApiResponse<TransferDetails>> {
    return apiClient.get<TransferDetails>(
      API_ENDPOINTS.getTransferDetails(transferId),
      true
    );
  }

  async getTransferHistory(
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<TransferHistory>> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (offset) params.append("offset", offset.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.getTransactionHistory}?${queryString}`
      : API_ENDPOINTS.getTransactionHistory;

    return apiClient.get<TransferHistory>(endpoint, true);
  }

  async getInvoice(transferId: string): Promise<Blob> {
    const response = await fetch(
      `${apiClient["baseUrl"]}${API_ENDPOINTS.getInvoice(transferId)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download invoice");
    }

    return response.blob();
  }
}

export const transferService = new TransferService();
