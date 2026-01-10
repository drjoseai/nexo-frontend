// __tests__/lib/store/auth.test.ts
// Tests unitarios para el Auth Store de NEXO v2.0
// Verifica: login, logout, register, loadUser, error handling

import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/store/auth';

// ============================================
// MOCK: API de autenticación
// ============================================

jest.mock('@/lib/api/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// ============================================
// MOCK: TokenManager
// ============================================

jest.mock('@/lib/services/token-manager', () => ({
  tokenManager: {
    initialize: jest.fn(),
    onLogout: jest.fn(),
    onRefresh: jest.fn(),
  },
}));

import { tokenManager } from '@/lib/services/token-manager';
import * as authApi from '@/lib/api/auth';

// ============================================
// TEST DATA
// ============================================

const mockUser = {
  id: 'user-123',
  email: 'test@nexo.com',
  display_name: 'Usuario Test',
  plan: 'free' as const,
  age_verified: false,
  preferred_language: 'es' as const,
  created_at: '2024-01-01T00:00:00Z',
  trial_ends_at: null,
};

const mockCredentials = {
  email: 'test@nexo.com',
  password: 'SecurePass123!',
};

// ============================================
// HELPER: Reset store state
// ============================================

const resetStore = () => {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
};

// ============================================
// TESTS
// ============================================

describe('useAuthStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ------------------------------------------
  // Initial State Tests
  // ------------------------------------------
  
  describe('estado inicial', () => {
    it('debe tener estado inicial correcto', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe exponer todas las acciones requeridas', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.loadUser).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  // ------------------------------------------
  // Login Tests
  // ------------------------------------------

  describe('login', () => {
    it('debe autenticar usuario exitosamente', async () => {
      (authApi.login as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login(mockCredentials);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBeNull(); // Tokens in httpOnly cookies now
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('debe manejar error de credenciales inválidas', async () => {
      const mockError = {
        response: {
          data: { message: 'Credenciales inválidas' },
        },
      };
      (authApi.login as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login(mockCredentials);
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Credenciales inválidas. Verifica tu email y contraseña.');
      expect(result.current.isLoading).toBe(false);
    });

    it('debe mostrar isLoading durante el login', async () => {
      let resolveLogin: (value: typeof mockUser) => void;
      const loginPromise = new Promise<typeof mockUser>((resolve) => {
        resolveLogin = resolve;
      });
      (authApi.login as jest.Mock).mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuthStore());

      // Start login (don't await)
      act(() => {
        result.current.login(mockCredentials);
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      // Resolve login
      await act(async () => {
        resolveLogin!(mockUser);
        await loginPromise;
      });

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ------------------------------------------
  // Logout Tests
  // ------------------------------------------

  describe('logout', () => {
    it('debe limpiar estado al hacer logout', async () => {
      // First, set authenticated state
      useAuthStore.setState({
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
      });

      (authApi.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe limpiar estado y llamar API de logout', async () => {
      // Setup authenticated state
      useAuthStore.setState({
        user: mockUser,
        token: 'jwt-token-abc123',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      (authApi.logout as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        result.current.logout();
      });

      // Verify state was cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(authApi.logout).toHaveBeenCalled();
    });

    it('debe funcionar aunque falle API de logout', async () => {
      (authApi.login as jest.Mock).mockResolvedValue(mockUser);
      
      const { result } = renderHook(() => useAuthStore());

      // Setup authenticated state
      await act(async () => {
        await result.current.login({
          email: 'test@nexo.com',
          password: 'password123',
        });
      });

      // Mock logout failure
      (authApi.logout as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      // Attempt logout
      await act(async () => {
        await result.current.logout();
      });

      // Should still clear state even if API fails
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  // ------------------------------------------
  // Register Tests
  // ------------------------------------------

  describe('register', () => {
    it('debe registrar y autenticar automáticamente', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({ user: mockUser });
      (authApi.login as jest.Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          email: 'nuevo@nexo.com',
          password: 'NewPass123!',
          display_name: 'Nuevo Usuario',
        });
      });

      // Should be authenticated after register
      expect(result.current.isAuthenticated).toBe(true);
      expect(authApi.login).toHaveBeenCalled();
    });

    it('debe manejar error de email duplicado', async () => {
      const mockError = {
        response: {
          data: { message: 'El email ya está registrado' },
        },
      };
      (authApi.register as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.register({
            email: 'existente@nexo.com',
            password: 'Pass123!',
          });
        } catch {
          // Expected
        }
      });

      expect(result.current.error).toBe('Este email ya está registrado.');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ------------------------------------------
  // LoadUser Tests
  // ------------------------------------------

  describe('loadUser', () => {
    it('debe cargar usuario desde token guardado', async () => {
      // Mock API to return user (tokens are in httpOnly cookies)
      (authApi.getCurrentUser as jest.Mock).mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadUser();
      });

      expect(tokenManager.initialize).toHaveBeenCalled();
      expect(tokenManager.onLogout).toHaveBeenCalled();
      expect(authApi.getCurrentUser).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('debe hacer logout si token es inválido', async () => {
      // Mock API to reject (invalid cookie)
      (authApi.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error('Token expired')
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadUser();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('no debe hacer nada si no hay token', async () => {
      // Mock API to reject (no cookie)
      (authApi.getCurrentUser as jest.Mock).mockRejectedValueOnce(
        new Error('No authentication')
      );

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.loadUser();
      });

      // With httpOnly cookies, loadUser always calls getCurrentUser
      // Backend will return 401 if no valid cookie exists
      expect(authApi.getCurrentUser).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  // ------------------------------------------
  // Utility Actions Tests
  // ------------------------------------------

  describe('acciones utilitarias', () => {
    it('clearError debe limpiar el error', () => {
      useAuthStore.setState({ error: 'Algún error' });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('setLoading debe cambiar estado de loading', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});





