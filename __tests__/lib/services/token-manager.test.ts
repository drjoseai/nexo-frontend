/**
 * Token Manager Tests for NEXO v2.0
 * Updated for httpOnly cookie authentication
 * Coverage target: >90% lines
 */

import { tokenManager, TokenManager } from '@/lib/services/token-manager';

describe('TokenManager', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    // Use a fresh instance to avoid cross-test contamination of callbacks
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    // Reset singleton callbacks to avoid leaking between tests
    tokenManager.setLogoutCallback(null as unknown as () => void);
    tokenManager.setRefreshCallback(null as unknown as () => void);
  });

  describe('Callback Registration', () => {
    it('should register logout callback via setLogoutCallback', () => {
      const callback = jest.fn();
      tokenManager.setLogoutCallback(callback);
      
      tokenManager.triggerLogout();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should register refresh callback via setRefreshCallback', () => {
      const callback = jest.fn();
      tokenManager.setRefreshCallback(callback);
      
      tokenManager.triggerRefresh();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should register logout callback via legacy onLogout method', () => {
      const callback = jest.fn();
      tokenManager.onLogout(callback);
      
      tokenManager.triggerLogout();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should register refresh callback via legacy onRefresh method', () => {
      const callback = jest.fn();
      tokenManager.onRefresh(callback);
      
      tokenManager.triggerRefresh();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authentication State', () => {
    it('should return true for isAuthenticated (cookies handled by browser)', () => {
      expect(tokenManager.isAuthenticated()).toBe(true);
    });
  });

  describe('triggerLogout', () => {
    it('should call logout callback and log message', () => {
      const callback = jest.fn();
      tokenManager.setLogoutCallback(callback);
      
      tokenManager.triggerLogout();
      
      expect(consoleSpy).toHaveBeenCalledWith('[TokenManager] Triggering logout');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not throw when no logout callback is set', () => {
      // Ensure callback is null
      const manager = new TokenManager();
      
      expect(() => manager.triggerLogout()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('[TokenManager] Triggering logout');
    });
  });

  describe('clearTokens', () => {
    it('should trigger logout callback when clearing tokens', () => {
      const callback = jest.fn();
      tokenManager.setLogoutCallback(callback);
      
      tokenManager.clearTokens();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not throw when clearing tokens without callback', () => {
      const manager = new TokenManager();
      expect(() => manager.clearTokens()).not.toThrow();
    });
  });

  describe('triggerRefresh', () => {
    it('should call refresh callback and log message', () => {
      const callback = jest.fn();
      tokenManager.setRefreshCallback(callback);
      
      tokenManager.triggerRefresh();
      
      expect(consoleSpy).toHaveBeenCalledWith('[TokenManager] Token refreshed by backend');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not throw when no refresh callback is set', () => {
      const manager = new TokenManager();
      
      expect(() => manager.triggerRefresh()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('[TokenManager] Token refreshed by backend');
    });
  });

  describe('initialize', () => {
    it('should log initialization message', () => {
      tokenManager.initialize();
      
      expect(consoleSpy).toHaveBeenCalledWith('[TokenManager] Initialized (httpOnly cookie mode)');
    });

    it('should be callable multiple times without error', () => {
      expect(() => {
        tokenManager.initialize();
        tokenManager.initialize();
      }).not.toThrow();
    });
  });

  describe('Class instantiation', () => {
    it('should create independent instances with own callbacks', () => {
      const manager1 = new TokenManager();
      const manager2 = new TokenManager();
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      
      manager1.setLogoutCallback(cb1);
      manager2.setLogoutCallback(cb2);
      
      manager1.triggerLogout();
      
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).not.toHaveBeenCalled();
    });
  });
});
