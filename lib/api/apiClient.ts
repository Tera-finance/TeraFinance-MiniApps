import { config } from "@/lib/config";
import type { ApiResponse } from "@/lib/types";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.backendApiUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit & { requiresAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchOptions } = options || {};

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions?.headers,
    };

    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
      });

      // If 401 and we require auth, try to refresh token
      if (response.status === 401 && requiresAuth) {
        const newToken = await this.refreshToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        return {
          success: false,
          data: {} as T,
          error: error.error || `HTTP error! status: ${response.status}`,
        };
      }

      const data = await response.json();

      // Check if the backend already returns ApiResponse format
      if (typeof data === "object" && "success" in data && "data" in data) {
        return data as ApiResponse<T>;
      }

      // If backend returns raw data, wrap it in ApiResponse format
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async get<T>(endpoint: string, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", requiresAuth });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    });
  }

  async delete<T>(endpoint: string, requiresAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", requiresAuth });
  }
}

export const apiClient = new ApiClient();
