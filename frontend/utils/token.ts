/**
 * Utility functions for JWT token management
 */

export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  exp: number;
  iat: number;
}

/**
 * Decode JWT token without verification
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 * @param token JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

/**
 * Get time until token expires in seconds
 * @param token JWT token string
 * @returns seconds until expiration, or 0 if expired/invalid
 */
export function getTokenExpirationTime(token: string): number {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return 0;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - currentTime;
  return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
}

/**
 * Check if token will expire soon (within 5 minutes)
 * @param token JWT token string
 * @returns true if token expires within 5 minutes
 */
export function isTokenExpiringSoon(token: string): boolean {
  const timeUntilExpiry = getTokenExpirationTime(token);
  const fiveMinutes = 5 * 60; // 5 minutes in seconds
  return timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes;
}
