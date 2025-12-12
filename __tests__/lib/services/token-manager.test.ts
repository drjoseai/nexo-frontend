/**
 * Tests for TokenManager Service
 * @module __tests__/lib/services/token-manager.test
 */

import { TokenManager, RefreshResponse } from '@/lib/services/token-manager';

// ============================================
// Mocks
// ============================================

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

const mockFetch = jest.fn();

// ============================================
// Setup
// ============================================

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    localStorageMock = createLocalStorageMock();
    Object.defineProperty(window, 'localStorage', { 
      value: localStorageMock,
      writable: true 
    });
    
    global.fetch = mockFetch;
    
    tokenManager = new TokenManager();
    
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // ============================================
  // Storage Tests
  // ============================================

  describe('Token Storage', () => {
    const mockResponse: RefreshResponse = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
    };

    it('should store tokens correctly', () => {
      tokenManager.setTokens(mockResponse);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('nexo_token', 'test-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('nexo_refresh_token', 'test-refresh-token');
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
    });

    it('should retrieve access token', () => {
      localStorageMock.setItem('nexo_token', 'stored-access-token');
      
      const token = tokenManager.getAccessToken();
      
      expect(token).toBe('stored-access-token');
    });

    it('should retrieve refresh token', () => {
      localStorageMock.setItem('nexo_refresh_token', 'stored-refresh-token');
      
      const token = tokenManager.getRefreshToken();
      
      expect(token).toBe('stored-refresh-token');
    });

    it('should clear all tokens', () => {
      tokenManager.setTokens(mockResponse);
      
      tokenManager.clearTokens();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nexo_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nexo_refresh_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nexo_token_expires_at');
    });

    it('should return null for missing access token', () => {
      const token = tokenManager.getAccessToken();
      
      expect(token).toBeNull();
    });

    it('should return null for missing refresh token', () => {
      const token = tokenManager.getRefreshToken();
      
      expect(token).toBeNull();
    });
  });

  // ============================================
  // Token State Tests
  // ============================================

  describe('Token State', () => {
    it('should return true for hasTokens when both tokens exist', () => {
      localStorageMock.setItem('nexo_token', 'access');
      localStorageMock.setItem('nexo_refresh_token', 'refresh');
      
      expect(tokenManager.hasTokens()).toBe(true);
    });

    it('should return false for hasTokens when access token missing', () => {
      localStorageMock.setItem('nexo_refresh_token', 'refresh');
      
      expect(tokenManager.hasTokens()).toBe(false);
    });

    it('should return false for hasTokens when refresh token missing', () => {
      localStorageMock.setItem('nexo_token', 'access');
      
      expect(tokenManager.hasTokens()).toBe(false);
    });

    it('should detect expired token', () => {
      const pastTimestamp = Date.now() - 1000;
      localStorageMock.setItem('nexo_token_expires_at', pastTimestamp.toString());
      
      expect(tokenManager.isExpired()).toBe(true);
    });

    it('should detect valid token', () => {
      const futureTimestamp = Date.now() + 3600000;
      localStorageMock.setItem('nexo_token_expires_at', futureTimestamp.toString());
      
      expect(tokenManager.isExpired()).toBe(false);
    });

    it('should return true for isExpired when no expiration set', () => {
      expect(tokenManager.isExpired()).toBe(true);
    });
  });

  // ============================================
  // Refresh Threshold Tests
  // ============================================

  describe('Refresh Threshold', () => {
    it('should indicate refresh needed when within threshold', () => {
      const expiresAt = Date.now() + (4 * 60 * 1000);
      localStorageMock.setItem('nexo_token_expires_at', expiresAt.toString());
      
      expect(tokenManager.shouldRefresh()).toBe(true);
    });

    it('should not indicate refresh needed when outside threshold', () => {
      const expiresAt = Date.now() + (10 * 60 * 1000);
      localStorageMock.setItem('nexo_token_expires_at', expiresAt.toString());
      
      expect(tokenManager.shouldRefresh()).toBe(false);
    });

    it('should not indicate refresh needed when already expired', () => {
      const pastTimestamp = Date.now() - 1000;
      localStorageMock.setItem('nexo_token_expires_at', pastTimestamp.toString());
      
      expect(tokenManager.shouldRefresh()).toBe(false);
    });

    it('should calculate time until expiry correctly', () => {
      const expiresIn = 3600000;
      const expiresAt = Date.now() + expiresIn;
      localStorageMock.setItem('nexo_token_expires_at', expiresAt.toString());
      
      const timeUntilExpiry = tokenManager.getTimeUntilExpiry();
      
      expect(timeUntilExpiry).toBeGreaterThan(expiresIn - 1000);
      expect(timeUntilExpiry).toBeLessThanOrEqual(expiresIn);
    });

    it('should return 0 for time until expiry when expired', () => {
      const pastTimestamp = Date.now() - 1000;
      localStorageMock.setItem('nexo_token_expires_at', pastTimestamp.toString());
      
      expect(tokenManager.getTimeUntilExpiry()).toBe(0);
    });
  });

  // ============================================
  // Refresh Logic Tests
  // ============================================

  describe('Token Refresh', () => {
    it('should refresh tokens successfully', async () => {
      localStorageMock.setItem('nexo_refresh_token', 'old-refresh-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });

      const result = await tokenManager.refresh();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/auth/refresh'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh_token: 'old-refresh-token' }),
        })
      );
    });

    it('should handle refresh failure gracefully', async () => {
      localStorageMock.setItem('nexo_refresh_token', 'invalid-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await tokenManager.refresh();

      expect(result).toBe(false);
    });

    it('should handle network error during refresh', async () => {
      localStorageMock.setItem('nexo_refresh_token', 'some-token');
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tokenManager.refresh();

      expect(result).toBe(false);
    });

    it('should call logout callback on 401 refresh response', async () => {
      const logoutCallback = jest.fn();
      tokenManager.onLogout(logoutCallback);
      
      localStorageMock.setItem('nexo_refresh_token', 'expired-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await tokenManager.refresh();

      expect(logoutCallback).toHaveBeenCalled();
    });

    it('should return false when no refresh token available', async () => {
      const result = await tokenManager.refresh();

      expect(result).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should call refresh callback on successful refresh', async () => {
      const refreshCallback = jest.fn();
      tokenManager.onRefresh(refreshCallback);
      
      localStorageMock.setItem('nexo_refresh_token', 'valid-token');
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          token_type: 'bearer',
          expires_in: 3600,
        }),
      });

      await tokenManager.refresh();

      expect(refreshCallback).toHaveBeenCalled();
    });
  });

  // ============================================
  // Initialization Tests
  // ============================================

  describe('Initialization', () => {
    it('should not throw when initialized without tokens', () => {
      expect(() => tokenManager.initialize()).not.toThrow();
    });

    it('should not attempt refresh when token is valid', () => {
      const futureTimestamp = Date.now() + 3600000;
      localStorageMock.setItem('nexo_token', 'valid-access');
      localStorageMock.setItem('nexo_refresh_token', 'valid-refresh');
      localStorageMock.setItem('nexo_token_expires_at', futureTimestamp.toString());

      tokenManager.initialize();

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Callback Tests
  // ============================================

  describe('Callbacks', () => {
    it('should register logout callback', () => {
      const callback = jest.fn();
      
      expect(() => tokenManager.onLogout(callback)).not.toThrow();
    });

    it('should register refresh callback', () => {
      const callback = jest.fn();
      
      expect(() => tokenManager.onRefresh(callback)).not.toThrow();
    });
  });
});
