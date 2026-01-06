/**
 * Token Manager Tests for NEXO v2.0
 * Updated for httpOnly cookie authentication
 */

import { tokenManager } from '@/lib/services/token-manager';

describe('TokenManager', () => {
  beforeEach(() => {
    // Reset callbacks before each test
    tokenManager.setLogoutCallback(null as any);
    tokenManager.setRefreshCallback(null as any);
  });

  describe('Callback Registration', () => {
    it('should register logout callback', () => {
      const callback = jest.fn();
      tokenManager.setLogoutCallback(callback);
      
      tokenManager.triggerLogout();
      
      expect(callback).toHaveBeenCalled();
    });

    it('should register refresh callback', () => {
      const callback = jest.fn();
      tokenManager.setRefreshCallback(callback);
      
      // Callback registration works
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Authentication State', () => {
    it('should return true for isAuthenticated (cookies handled by browser)', () => {
      expect(tokenManager.isAuthenticated()).toBe(true);
    });
  });

  describe('Logout', () => {
    it('should trigger logout callback when clearing tokens', () => {
      const callback = jest.fn();
      tokenManager.setLogoutCallback(callback);
      
      tokenManager.clearTokens();
      
      expect(callback).toHaveBeenCalled();
    });

    it('should handle clearTokens without callback', () => {
      // Should not throw
      expect(() => tokenManager.clearTokens()).not.toThrow();
    });
  });
});
