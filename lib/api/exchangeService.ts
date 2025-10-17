import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/lib/config";
import type { ApiResponse, Currency, ExchangeRate, ConversionPath } from "@/lib/types";

class ExchangeService {
  async getCurrencies(): Promise<ApiResponse<Currency[]>> {
    return apiClient.get<Currency[]>(API_ENDPOINTS.getCurrencies);
  }

  async getExchangeRate(from: string, to: string): Promise<ApiResponse<ExchangeRate>> {
    return apiClient.get<ExchangeRate>(`${API_ENDPOINTS.getExchangeRate}?from=${from}&to=${to}`);
  }

  async getConversionPath(from: string, to: string): Promise<ApiResponse<ConversionPath>> {
    return apiClient.get<ConversionPath>(
      `${API_ENDPOINTS.getConversionPath}?from=${from}&to=${to}`
    );
  }
}

export const exchangeService = new ExchangeService();
