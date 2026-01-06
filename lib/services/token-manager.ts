/**
 * Token Manager Service for NEXO v2.0
 * 
 * Simplified for httpOnly cookie authentication.
 * Browser automatically handles cookie storage and transmission.
 * Backend manages token lifecycle via Set-Cookie headers.
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
// TokenManager Class
// ============================================

/**
 * Simplified TokenManager for httpOnly cookie-based authentication.
 * 
 * Key Changes:
 * - No localStorage operations (cookies managed by browser)
 * - No token refresh scheduling (backend handles expiration)
 * - No manual token storage (Set-Cookie headers do this)
 * - Callbacks preserved for state management integration
 */
class TokenManager {
  private onLogoutCallback: LogoutCallback | null = null;
  private onRefreshCallback: TokenRefreshCallback | null = null;

  // ============================================
  // Callback Registration
  // ============================================

  /**
   * Register callback to be called when logout is triggered
   */
  setLogoutCallback(callback: LogoutCallback): void {
    this.onLogoutCallback = callback;
  }

  /**
   * Register callback to be called when token is refreshed
   */
  setRefreshCallback(callback: TokenRefreshCallback): void {
    this.onRefreshCallback = callback;
  }

  /**
   * Legacy method name for backward compatibility
   */
  onLogout(callback: LogoutCallback): void {
    this.setLogoutCallback(callback);
  }

  /**
   * Legacy method name for backward compatibility
   */
  onRefresh(callback: TokenRefreshCallback): void {
    this.setRefreshCallback(callback);
  }

  // ============================================
  // Token Operations (Simplified)
  // ============================================

  /**
   * Check if user is authenticated.
   * With httpOnly cookies, we rely on backend verification.
   * The actual authentication check happens via API calls.
   */
  isAuthenticated(): boolean {
    // Browser sends cookies automatically
    // Backend verifies and returns user data or 401
    return true; // Let backend handle verification
  }

  /**
   * Trigger logout callback.
   * Actual cookie clearing happens on backend via logout endpoint.
   */
  triggerLogout(): void {
    console.log('[TokenManager] Triggering logout');
    
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  /**
   * Clear tokens by triggering logout.
   * Backend will clear httpOnly cookies via logout endpoint.
   */
  clearTokens(): void {
    this.triggerLogout();
  }

  /**
   * Trigger refresh callback.
   * Called when backend refreshes tokens automatically.
   */
  triggerRefresh(): void {
    console.log('[TokenManager] Token refreshed by backend');
    
    if (this.onRefreshCallback) {
      this.onRefreshCallback();
    }
  }

  /**
   * Initialize token manager.
   * With httpOnly cookies, no initialization needed.
   * Browser and backend handle everything automatically.
   */
  initialize(): void {
    console.log('[TokenManager] Initialized (httpOnly cookie mode)');
    // No-op: cookies are automatically sent with requests
  }
}

// ============================================
// Singleton Export
// ============================================

export const tokenManager = new TokenManager();

export { TokenManager };
