import { HttpClient } from './http';
import { config } from '../lib/config';

export interface RegisterDto {
  anonymous_name?: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private http: HttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  async register(data: RegisterDto): Promise<TokenResponse> {
    const response = await this.http.post<TokenResponse>('/auth/register', data);
    this.storeTokens(response);
    return response;
  }

  async login(data: LoginDto): Promise<TokenResponse> {
    const response = await this.http.post<TokenResponse>('/auth/login', data);
    this.storeTokens(response);
    return response;
  }

  async adminLogin(data: AdminLoginDto): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/admin/login', data);
  }

  async verifyOtp(data: VerifyOtpDto): Promise<TokenResponse> {
    const response = await this.http.post<TokenResponse>('/auth/admin/verify-otp', data);
    this.storeTokens(response);
    return response;
  }

  private storeTokens(tokens: TokenResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  async refreshUserToken(): Promise<TokenResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      // Use fetch directly to avoid triggering auto-refresh in HttpClient
      const response = await fetch(`${config.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const tokens = data.data !== undefined ? data.data : data;
      this.storeTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  async refreshAdminToken(): Promise<TokenResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      // Use fetch directly to avoid triggering auto-refresh in HttpClient
      const response = await fetch(`${config.apiUrl}/auth/admin/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Admin token refresh failed');
      }

      const data = await response.json();
      const tokens = data.data !== undefined ? data.data : data;
      this.storeTokens(tokens);
      return tokens;
    } catch (error) {
      console.error('Admin token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}
