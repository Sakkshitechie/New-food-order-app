import { Injectable } from '@angular/core';

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'currentUser';
  private readonly TOKEN_EXPIRES_KEY = 'tokenExpires';

  constructor() {}

  // Store tokens with expiry information
  setTokens(accessToken: string, refreshToken: string, expiresIn: string = '15m'): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    const expiresAt = this.calculateExpiryTime(expiresIn);

    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
  }

  // Get access token
  getAccessToken(): string | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }
    
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }
    
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Get user data
  getUser(): any | null {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }
    
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Store user data
  setUser(user: any): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Check if access token is expired
  isAccessTokenExpired(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return true;
    }

    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expiresAt) {
      return true;
    }

    const currentTime = Date.now();
    const tokenExpiryTime = parseInt(expiresAt, 10);
    
    // Add 30 second buffer
    return (tokenExpiryTime - 30000) < currentTime;
  }

  // Check if tokens exist
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  // Clear all stored tokens and user data
  clearTokens(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
  }

  // Get all token information
  getTokenInfo(): TokenInfo | null {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken || !refreshToken) {
      return null;
    }

    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    const user = this.getUser();

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? parseInt(expiresAt, 10) : 0,
      user
    };
  }

  // Update only access token (for refresh scenarios)
  updateAccessToken(accessToken: string, expiresIn: string = '15m'): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    const expiresAt = this.calculateExpiryTime(expiresIn);
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toString());
  }

  // Decode JWT token payload (client-side only for expiry checking)
  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Get token expiry time from token payload
  getTokenExpiryFromToken(token: string): number | null {
    const payload = this.decodeToken(token);
    return payload?.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  }

  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      // Test localStorage functionality
      const testKey = '__test_storage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private calculateExpiryTime(expiresIn: string): number {
    const currentTime = Date.now();
    
    // Parse expiry string (e.g., "15m", "1h", "7d")
    const timeValue = parseInt(expiresIn);
    const timeUnit = expiresIn.replace(timeValue.toString(), '');
    
    let milliseconds = 0;
    
    switch (timeUnit) {
      case 's':
        milliseconds = timeValue * 1000;
        break;
      case 'm':
        milliseconds = timeValue * 60 * 1000;
        break;
      case 'h':
        milliseconds = timeValue * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = timeValue * 24 * 60 * 60 * 1000;
        break;
      default:
        // Default to minutes if no unit specified
        milliseconds = timeValue * 60 * 1000;
    }
    
    return currentTime + milliseconds;
  }
}