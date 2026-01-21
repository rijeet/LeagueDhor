import { config } from '../lib/config';

export class HttpClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    // If already refreshing, wait for the existing refresh to complete
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    // Determine if we should use admin or user refresh endpoint
    // We'll try user first, then admin if user fails
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        // Try user refresh first
        const userResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const tokens = userData.data !== undefined ? userData.data : userData;
          this.storeTokens(tokens.accessToken, tokens.refreshToken);
          return tokens.accessToken;
        }

        // If user refresh fails, try admin refresh
        const adminResponse = await fetch(`${this.baseUrl}/auth/admin/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          const tokens = adminData.data !== undefined ? adminData.data : adminData;
          this.storeTokens(tokens.accessToken, tokens.refreshToken);
          return tokens.accessToken;
        }

        return null;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private getHeadersWithToken(token?: string | null): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const accessToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(
    response: Response,
    retryFn: () => Promise<Response>
  ): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // If 401 Unauthorized, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await this.refreshTokenIfNeeded();
      if (newToken) {
        // Retry the original request with new token
        const retryResponse = await retryFn();
        return this.handleResponse<T>(retryResponse, retryFn);
      } else {
        // Refresh failed, logout user
        this.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please login again.');
      }
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      if (isJson) {
        try {
          const errorData = await response.json();
          // Extract message from standardized API response
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, use default message
        }
      } else {
        try {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        } catch (e) {
          // If text parsing fails, use default message
        }
      }
      
      const error: any = new Error(errorMessage);
      error.status = response.status;
      error.response = { data: { message: errorMessage } };
      throw error;
    }
    
    if (isJson) {
      const data = await response.json();
      // If response has data property (standardized format), return it
      return data.data !== undefined ? data.data : data;
    }
    
    return response.text() as unknown as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const body = JSON.stringify(data);
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body,
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const body = JSON.stringify(data);
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body,
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const makeRequest = () => fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }
}
