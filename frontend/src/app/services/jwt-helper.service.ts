import { Injectable } from '@angular/core';

export interface JwtPayload {
  userId: string;
  email: string;
  name?: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JwtHelperService {

  constructor() {}

  /**
   * Decode JWT token without verification (client-side only)
   */
  decodeToken(token: string): JwtPayload | null {
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = parts[1];
      const decoded = this.urlBase64Decode(payload);
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string, offsetSeconds: number = 0): boolean {
    if (!token) return true;

    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < (currentTime + offsetSeconds);
  }

  /**
   * Get token expiration date
   */
  getTokenExpirationDate(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return null;

    return new Date(payload.exp * 1000);
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(token: string): number | null {
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) return null;

    const currentTime = Date.now();
    return Math.floor((expirationDate.getTime() - currentTime) / 1000);
  }

  /**
   * Check if token is valid format
   */
  isValidTokenFormat(token: string): boolean {
    if (!token) return false;
    
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Get user information from token
   */
  getUserFromToken(token: string): { userId: string; email: string; name?: string } | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name
    };
  }

  /**
   * Check if token type matches expected type
   */
  isTokenType(token: string, expectedType: 'access' | 'refresh'): boolean {
    const payload = this.decodeToken(token);
    return payload?.type === expectedType;
  }

  /**
   * Get token issue time
   */
  getTokenIssueTime(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload || !payload.iat) return null;

    return new Date(payload.iat * 1000);
  }

  /**
   * Check if token was issued recently (within last X seconds)
   */
  isTokenFresh(token: string, maxAgeSeconds: number = 300): boolean {
    const issueTime = this.getTokenIssueTime(token);
    if (!issueTime) return false;

    const currentTime = Date.now();
    const tokenAge = (currentTime - issueTime.getTime()) / 1000;
    
    return tokenAge <= maxAgeSeconds;
  }

  /**
   * Base64 URL decode helper
   */
  private urlBase64Decode(str: string): string {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw new Error('Illegal base64url string!');
    }
    return decodeURIComponent(
      atob(output)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  /**
   * Print token information (for debugging)
   */
  printTokenInfo(token: string): void {
    const payload = this.decodeToken(token);
    if (!payload) {
      return;
    }

    console.group('Token Information');
    console.groupEnd();
  }
}