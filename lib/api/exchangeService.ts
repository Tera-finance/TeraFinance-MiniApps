import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/lib/config";
import type { ApiResponse, ExchangeRate, TransferQuote } from "@/lib/types";

interface AllRatesResponse {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
}

interface ConvertResponse {
  from: string;
  to: string;
  inputAmount: number;
  outputAmount: number;
  rate: number;
  timestamp: string;
}

class ExchangeService {
  /**
   * Get supported currencies
   */
  async getCurrencies(): Promise<ApiResponse<{ currencies: string[] }>> {
    return apiClient.get<{ currencies: string[] }>(API_ENDPOINTS.getCurrencies);
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<ApiResponse<ExchangeRate>> {
    return apiClient.get<ExchangeRate>(`${API_ENDPOINTS.getExchangeRate}?from=${from}&to=${to}`);
  }

  /**
   * Get all exchange rates for a base currency
   */
  async getAllRates(baseCurrency: string = "USD"): Promise<ApiResponse<AllRatesResponse>> {
    return apiClient.get<AllRatesResponse>(
      `${API_ENDPOINTS.getAllRates}?base=${baseCurrency}`
    );
  }

  /**
   * Get a transfer quote with fees
   */
  async getQuote(
    senderCurrency: string,
    recipientCurrency: string,
    amount: number
  ): Promise<ApiResponse<TransferQuote>> {
    return apiClient.post<TransferQuote>(API_ENDPOINTS.getQuote, {
      senderCurrency,
      recipientCurrency,
      amount,
    });
  }

  /**
   * Convert amount between currencies
   */
  async convertAmount(
    from: string,
    to: string,
    amount: number
  ): Promise<ApiResponse<ConvertResponse>> {
    return apiClient.post<ConvertResponse>(API_ENDPOINTS.convertAmount, {
      from,
      to,
      amount,
    });
  }
}

export const exchangeService = new ExchangeService();
