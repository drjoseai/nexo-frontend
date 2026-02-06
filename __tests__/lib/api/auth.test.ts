/**
 * Tests for Authentication API Services
 * @module __tests__/lib/api/auth.test.ts
 */

import { apiClient } from '@/lib/api/client';
import {
  login,
  register,
  getCurrentUser,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '@/lib/api/auth';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // login
  // ============================================
  describe('login', () => {
    const mockCredentials = {
      email: 'test@nexo.ai',
      password: 'password123',
    };

    const mockUserResponse = {
      data: {
        id: 'user-123',
        email: 'test@nexo.ai',
        name: 'Test User',
        plan: 'free',
        language: 'es',
        age_verified: true,
        trial_ends_at: null,
        created_at: '2024-01-01T00:00:00Z',
      },
    };

    it('should login successfully with correct credentials', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockUserResponse);

      const result = await login(mockCredentials);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@nexo.ai',
        display_name: 'Test User',
        plan: 'free',
        age_verified: true,
        preferred_language: 'es',
        created_at: '2024-01-01T00:00:00Z',
        trial_ends_at: null,
        onboarding_completed: false,
      });
    });

    it('should send form-urlencoded data with username field', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockUserResponse);

      await login(mockCredentials);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        expect.any(URLSearchParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        }
      );

      // Verify URLSearchParams has correct fields
      const formData = mockedApiClient.post.mock.calls[0][1] as URLSearchParams;
      expect(formData.get('username')).toBe('test@nexo.ai');
      expect(formData.get('password')).toBe('password123');
    });

    it('should handle user with null name', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: {
          ...mockUserResponse.data,
          name: null,
        },
      });

      const result = await login(mockCredentials);

      expect(result.display_name).toBeNull();
    });

    it('should default language to es when not provided', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: {
          ...mockUserResponse.data,
          language: '',
        },
      });

      const result = await login(mockCredentials);

      expect(result.preferred_language).toBe('es');
    });

    it('should throw on login failure', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(login(mockCredentials)).rejects.toThrow('Invalid credentials');
    });
  });

  // ============================================
  // register
  // ============================================
  describe('register', () => {
    const mockRegisterData = {
      email: 'new@nexo.ai',
      password: 'securePass123',
      display_name: 'New User',
      preferred_language: 'en' as const,
      date_of_birth: '1990-05-15',
      tos_accepted: true,
    };

    const mockTokenResponse = {
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
      },
    };

    const mockUserResponse = {
      data: {
        id: 'new-user-456',
        email: 'new@nexo.ai',
        name: 'New User',
        plan: 'trial',
        language: 'en',
        age_verified: false,
        trial_ends_at: '2025-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      },
    };

    it('should register user successfully', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockTokenResponse);
      mockedApiClient.get.mockResolvedValueOnce(mockUserResponse);

      const result = await register(mockRegisterData);

      expect(result).toEqual({
        user: {
          id: 'new-user-456',
          email: 'new@nexo.ai',
          display_name: 'New User',
          plan: 'trial',
          age_verified: false,
          preferred_language: 'en',
          created_at: '2024-01-01T00:00:00Z',
          trial_ends_at: '2025-01-01T00:00:00Z',
          onboarding_completed: false,
        },
        message: 'Registration successful',
      });
    });

    it('should send correct backend data format', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockTokenResponse);
      mockedApiClient.get.mockResolvedValueOnce(mockUserResponse);

      await register(mockRegisterData);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', {
        email: 'new@nexo.ai',
        password: 'securePass123',
        name: 'New User',
        language: 'en',
        date_of_birth: '1990-05-15',
        tos_accepted: true,
      });
    });

    it('should handle missing display_name', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockTokenResponse);
      mockedApiClient.get.mockResolvedValueOnce(mockUserResponse);

      await register({
        email: 'new@nexo.ai',
        password: 'securePass123',
        date_of_birth: '1990-05-15',
        tos_accepted: true,
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/auth/register', {
        email: 'new@nexo.ai',
        password: 'securePass123',
        name: null,
        language: 'es',
        date_of_birth: '1990-05-15',
        tos_accepted: true,
      });
    });

    it('should default language to es', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockTokenResponse);
      mockedApiClient.get.mockResolvedValueOnce(mockUserResponse);

      await register({
        email: 'new@nexo.ai',
        password: 'securePass123',
        date_of_birth: '1990-05-15',
        tos_accepted: true,
      });

      const callArgs = mockedApiClient.post.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.language).toBe('es');
    });

    it('should throw on registration failure', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Email already exists'));

      await expect(register(mockRegisterData)).rejects.toThrow('Email already exists');
    });
  });

  // ============================================
  // getCurrentUser
  // ============================================
  describe('getCurrentUser', () => {
    const mockUserResponse = {
      data: {
        id: 'user-123',
        email: 'current@nexo.ai',
        name: 'Current User',
        plan: 'plus',
        language: 'es',
        age_verified: true,
        trial_ends_at: null,
        created_at: '2024-01-01T00:00:00Z',
      },
    };

    it('should fetch current user successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockUserResponse);

      const result = await getCurrentUser();

      expect(result).toEqual({
        id: 'user-123',
        email: 'current@nexo.ai',
        display_name: 'Current User',
        plan: 'plus',
        age_verified: true,
        preferred_language: 'es',
        created_at: '2024-01-01T00:00:00Z',
        trial_ends_at: null,
        onboarding_completed: false,
      });
    });

    it('should call correct endpoint', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockUserResponse);

      await getCurrentUser();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/auth/me');
    });

    it('should throw on failure', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  // ============================================
  // logout
  // ============================================
  describe('logout', () => {
    it('should call logout endpoint', async () => {
      mockedApiClient.post.mockResolvedValueOnce({});

      await logout();

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });

    it('should not throw on server error (silent fail)', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockedApiClient.post.mockRejectedValueOnce(new Error('Server error'));

      await expect(logout()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Server logout failed, continuing with client-side cleanup',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // refreshToken
  // ============================================
  describe('refreshToken', () => {
    const mockRefreshResponse = {
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        token_type: 'bearer',
        expires_in: 3600,
      },
    };

    it('should refresh token successfully', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockRefreshResponse);

      const result = await refreshToken();

      expect(result).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      });
    });

    it('should send empty body with credentials (cookie-based auth)', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockRefreshResponse);

      await refreshToken();

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/refresh',
        {},
        { withCredentials: true }
      );
    });

    it('should throw on refresh failure', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Token expired'));

      await expect(refreshToken()).rejects.toThrow('Token expired');
    });
  });

  // ============================================
  // forgotPassword
  // ============================================
  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { message: 'Reset email sent' },
      });

      const result = await forgotPassword('user@nexo.ai');

      expect(result).toEqual({ message: 'Reset email sent' });
    });

    it('should send email as query param', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { message: 'Reset email sent' },
      });

      await forgotPassword('user@nexo.ai');

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/forgot-password',
        null,
        { params: { email: 'user@nexo.ai' } }
      );
    });

    it('should throw on failure', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('User not found'));

      await expect(forgotPassword('unknown@nexo.ai')).rejects.toThrow('User not found');
    });
  });

  // ============================================
  // resetPassword
  // ============================================
  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { message: 'Password reset successful' },
      });

      const result = await resetPassword('valid-token', 'newPassword123');

      expect(result).toEqual({ message: 'Password reset successful' });
    });

    it('should send token and new password in body', async () => {
      mockedApiClient.post.mockResolvedValueOnce({
        data: { message: 'Password reset successful' },
      });

      await resetPassword('valid-token', 'newPassword123');

      expect(mockedApiClient.post).toHaveBeenCalledWith('/api/v1/auth/reset-password', {
        token: 'valid-token',
        new_password: 'newPassword123',
      });
    });

    it('should throw on invalid token', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Invalid or expired token'));

      await expect(resetPassword('invalid-token', 'newPass')).rejects.toThrow(
        'Invalid or expired token'
      );
    });
  });
});
