import { apiClient } from "./apiClient";
import { API_ENDPOINTS } from "@/lib/config";
import type { ApiResponse, LoginResponse, User } from "@/lib/types";

class AuthService {
  async login(whatsappNumber: string, countryCode: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.login,
      { whatsappNumber, countryCode }
    );

    // Debug logging
    console.log("Login response:", JSON.stringify(response, null, 2));

    if (response.success && response.data) {
      // Check if response.data has tokens directly or if they're nested
      const tokens = response.data.tokens;
      const user = response.data.user;

      if (tokens && user) {
        // Store tokens in localStorage
        localStorage.setItem("accessToken", tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        console.error("Invalid response structure:", {
          hasTokens: !!tokens,
          hasUser: !!user,
          responseData: response.data,
        });
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.logout, {}, true);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }
}

export const authService = new AuthService();
