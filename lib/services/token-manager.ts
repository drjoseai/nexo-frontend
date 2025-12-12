/**
 * Token Manager Service for NEXO v2.0
 * 
 * Handles token storage, refresh logic, and expiration management.
 * Implements automatic token refresh before expiration.
 * 
 * @module lib/services/token-manager
 */

// ============================================
// Types
// ============================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

type TokenRefreshCallback = () => void;
type LogoutCallback = () => void;

// ============================================
// Constants
// ============================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nexo_token',
  REFRESH_TOKEN: 'nexo_refresh_token',
  EXPIRES_AT: 'nexo_token_expires_at',
} as const;

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;
const MIN_REFRESH_INTERVAL_MS = 10 * 1000;

// ============================================
// TokenManager Class
// ============================================

class TokenManager {
  private refreshPromise: Promise<boolean> | null = null;
  private lastRefreshAttempt: number = 0;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private onLogoutCallback: LogoutCallback | null = null;
  private onRefreshCallback: TokenRefreshCallback | null = null;

  // ============================================
  // Storage Methods
  // ============================================

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('[TokenManager] Error reading access token:', error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('[TokenManager] Error reading refresh token:', error);
      return null;
    }
  }

  getExpiresAt(): number | null {
    if (!this.isBrowser()) return null;
    
    try {
      const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      return expiresAt ? parseInt(expiresAt, 10) : null;
    } catch (error) {
      console.error('[TokenManager] Error reading expires at:', error);
      return null;
    }
  }

  setTokens(response: RefreshResponse): void {
    if (!this.isBrowser()) return;
    
    try {
      const expiresAt = Date.now() + (response.expires_in * 1000);
      
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
      
      this.scheduleRefresh(response.expires_in * 1000);
      
      console.log('[TokenManager] Tokens stored, expires at:', new Date(expiresAt).toISOString());
    } catch (error) {
      console.error('[TokenManager] Error storing tokens:', error);
    }
  }

  clearTokens(): void {
    if (!this.isBrowser()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
      
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      console.log('[TokenManager] Tokens cleared');
    } catch (error) {
      console.error('[TokenManager] Error clearing tokens:', error);
    }
  }

  // ============================================
  // Token State Methods
  // ============================================

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  isExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return true;
    
    return Date.now() >= expiresAt;
  }

  shouldRefresh(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return false;
    
    const timeUntilExpiry = expiresAt - Date.now();
    return timeUntilExpiry <= REFRESH_THRESHOLD_MS && timeUntilExpiry > 0;
  }

  getTimeUntilExpiry(): number {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return 0;
    
    return Math.max(0, expiresAt - Date.now());
  }

  // ============================================
  // Refresh Logic
  // ============================================

  private scheduleRefresh(expiresInMs: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    const refreshInMs = Math.max(0, expiresInMs - REFRESH_THRESHOLD_MS);
    
    if (refreshInMs > 0) {
      this.refreshTimer = setTimeout(() => {
        console.log('[TokenManager] Auto-refresh triggered');
        this.refresh().catch((error) => {
          console.error('[TokenManager] Auto-refresh failed:', error);
        });
      }, refreshInMs);
      
      console.log('[TokenManager] Refresh scheduled in', Math.round(refreshInMs / 1000), 'seconds');
    }
  }

  async refresh(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastRefreshAttempt < MIN_REFRESH_INTERVAL_MS) {
      console.log('[TokenManager] Refresh throttled, too recent');
      return this.refreshPromise ? this.refreshPromise : Promise.resolve(false);
    }
    
    if (this.refreshPromise) {
      console.log('[TokenManager] Refresh already in progress, waiting...');
      return this.refreshPromise;
    }
    
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('[TokenManager] No refresh token available');
      this.handleLogout();
      return false;
    }
    
    this.lastRefreshAttempt = now;
    
    this.refreshPromise = this.executeRefresh(refreshToken);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async executeRefresh(refreshToken: string): Promise<boolean> {
    try {
      console.log('[TokenManager] Executing refresh...');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v2/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      
      if (!response.ok) {
        console.error('[TokenManager] Refresh failed with status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
          this.handleLogout();
        }
        
        return false;
      }
      
      const data: RefreshResponse = await response.json();
      
      this.setTokens(data);
      
      if (this.onRefreshCallback) {
        this.onRefreshCallback();
      }
      
      console.log('[TokenManager] Refresh successful');
      return true;
    } catch (error) {
      console.error('[TokenManager] Refresh error:', error);
      return false;
    }
  }

  private handleLogout(): void {
    this.clearTokens();
    
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  // ============================================
  // Callback Registration
  // ============================================

  onLogout(callback: LogoutCallback): void {
    this.onLogoutCallback = callback;
  }

  onRefresh(callback: TokenRefreshCallback): void {
    this.onRefreshCallback = callback;
  }

  // ============================================
  // Initialization
  // ============================================

  initialize(): void {
    if (!this.isBrowser()) return;
    
    console.log('[TokenManager] Initializing...');
    
    if (!this.hasTokens()) {
      console.log('[TokenManager] No tokens found');
      return;
    }
    
    if (this.isExpired()) {
      console.log('[TokenManager] Token expired, attempting refresh...');
      this.refresh().catch(() => {
        console.log('[TokenManager] Initial refresh failed');
      });
      return;
    }
    
    const timeUntilExpiry = this.getTimeUntilExpiry();
    if (timeUntilExpiry > 0) {
      this.scheduleRefresh(timeUntilExpiry);
    }
    
    console.log('[TokenManager] Initialized with valid token');
  }
}

// ============================================
// Singleton Export
// ============================================

export const tokenManager = new TokenManager();

export { TokenManager };
