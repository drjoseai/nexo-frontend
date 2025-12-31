/**
 * Authentication Store for NEXO v2.0
 * 
 * Manages global authentication state using Zustand with persistence.
 * Integrates with TokenManager for automatic token refresh.
 * 
 * @module lib/store/auth
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, LoginRequest, RegisterRequest } from '@/types/auth';
import * as authApi from '@/lib/api/auth';
import { tokenManager } from '@/lib/services/token-manager';
import { toast } from '@/lib/services/toast-service';

// ============================================
// Cookie helpers for middleware compatibility
// ============================================

const COOKIE_NAME = 'nexo_access_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Set authentication cookie
 * Required for Next.js middleware to verify auth state
 */
function setAuthCookie(token: string): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax; Secure`;
}

/**
 * Remove authentication cookie
 */
function removeAuthCookie(): void {
  if (typeof window === 'undefined') return;
  
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax; Secure`;
}

/**
 * Initial authentication state
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Authentication store with Zustand
 * 
 * Provides authentication state management with persistence across sessions.
 * Integrates with TokenManager for automatic token refresh.
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Authenticate a user with email and password
       */
      login: async (credentials: LoginRequest) => {
        const toastId = toast.loading('Iniciando sesión...');
        
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.login(credentials);

          // Store tokens using TokenManager
          tokenManager.setTokens({
            access_token: response.access_token,
            refresh_token: response.refresh_token,
            token_type: response.token_type,
            expires_in: response.expires_in,
          });

          // Store user in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('nexo_user', JSON.stringify(response.user));
          }

          // Store token in cookie for middleware access
          setAuthCookie(response.access_token);

          // Update store state
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            error: null,
          });

          toast.dismiss(toastId);
          toast.success(`¡Bienvenido, ${response.user.display_name || response.user.email}!`);
        } catch (error: unknown) {
          toast.dismiss(toastId);
          const errorMessage = toast.parseApiError(error);
          toast.error(errorMessage);
          
          set({ 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Register a new user account
       */
      register: async (data: RegisterRequest) => {
        const toastId = toast.loading('Creando tu cuenta...');
        
        try {
          set({ isLoading: true, error: null });

          await authApi.register(data);

          toast.dismiss(toastId);
          toast.success('¡Cuenta creada exitosamente!');

          // After successful registration, automatically log in
          await get().login({
            email: data.email,
            password: data.password,
          });
        } catch (error: unknown) {
          toast.dismiss(toastId);
          const errorMessage = toast.parseApiError(error);
          toast.error(errorMessage);
          
          set({ 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Log out the current user
       */
      logout: () => {
        // Get refresh token before clearing
        const refreshToken = tokenManager.getRefreshToken();
        
        // Call logout API with refresh token
        if (refreshToken) {
          authApi.logout().catch((error) => {
            console.warn('Logout API call failed:', error);
          });
        }

        // Clear tokens using TokenManager
        tokenManager.clearTokens();

        // Remove auth cookie
        removeAuthCookie();

        // Clear user from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nexo_user');
        }

        // Reset state to initial values
        set(initialState);
        
        toast.info('Sesión cerrada');
      },

      /**
       * Load user data from stored token
       * 
       * Enhanced version that validates consistency between:
       * - Zustand persist storage (nexo-auth-storage)
       * - TokenManager storage (nexo_refresh_token, etc)
       */
      loadUser: async () => {
        try {
          if (typeof window === 'undefined') {
            return;
          }

          // Initialize TokenManager
          tokenManager.initialize();

          // Register logout callback
          tokenManager.onLogout(() => {
            console.log('[AuthStore] TokenManager triggered logout');
            removeAuthCookie();
            if (typeof window !== 'undefined') {
              localStorage.removeItem('nexo_user');
            }
            set(initialState);
          });

          // Register refresh callback to update cookie
          tokenManager.onRefresh(() => {
            const newToken = tokenManager.getAccessToken();
            if (newToken) {
              console.log('[AuthStore] Token refreshed, updating cookie');
              setAuthCookie(newToken);
              set({ token: newToken });
            }
          });

          // ============================================
          // CONSISTENCY CHECK - Fix for cache issues
          // ============================================
          
          const persistedState = get();
          const hasTokenInManager = !!tokenManager.getAccessToken();
          const hasRefreshToken = !!tokenManager.getRefreshToken();
          
          console.log('[AuthStore] State check:', {
            persistedAuth: persistedState.isAuthenticated,
            hasAccessToken: hasTokenInManager,
            hasRefreshToken: hasRefreshToken,
          });

          // CASE 1: No tokens at all - ensure clean state
          if (!hasTokenInManager && !hasRefreshToken) {
            console.log('[AuthStore] No tokens found, ensuring clean state');
            if (persistedState.isAuthenticated) {
              console.warn('[AuthStore] Inconsistent state detected - clearing');
              set(initialState);
            }
            return;
          }

          // CASE 2: Have tokens but state says not authenticated - FIX THIS
          if ((hasTokenInManager || hasRefreshToken) && !persistedState.isAuthenticated) {
            console.log('[AuthStore] Tokens exist but state not authenticated - validating tokens');
          }

          // CASE 3: State says authenticated but no tokens - CLEAR STATE
          if (persistedState.isAuthenticated && !hasTokenInManager && !hasRefreshToken) {
            console.warn('[AuthStore] Authenticated state but no tokens - clearing');
            set(initialState);
            return;
          }

          // ============================================
          // TOKEN VALIDATION
          // ============================================

          // Get token from TokenManager
          const token = tokenManager.getAccessToken();
          
          if (!token) {
            // Try to refresh if we have refresh token
            if (hasRefreshToken) {
              console.log('[AuthStore] No access token but have refresh - attempting refresh');
              const refreshed = await tokenManager.refresh();
              
              if (!refreshed) {
                console.log('[AuthStore] Refresh failed, logging out');
                get().logout();
                return;
              }
            } else {
              console.log('[AuthStore] No tokens available');
              set(initialState);
              return;
            }
          }

          // Check if token is expired and needs refresh
          if (tokenManager.isExpired()) {
            console.log('[AuthStore] Token expired, attempting refresh...');
            const refreshed = await tokenManager.refresh();
            
            if (!refreshed) {
              console.log('[AuthStore] Refresh failed, logging out');
              get().logout();
              return;
            }
          }

          // Ensure cookie is set
          const currentToken = tokenManager.getAccessToken();
          if (currentToken) {
            setAuthCookie(currentToken);
          }

          set({ isLoading: true, error: null });

          // Fetch current user data
          const user = await authApi.getCurrentUser();

          // Update state with validated data
          set({
            user,
            token: currentToken,
            isAuthenticated: true,
            error: null,
          });

          console.log('[AuthStore] User loaded successfully:', user.email);
        } catch (error: unknown) {
          console.warn('[AuthStore] Failed to load user, logging out:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Clear any authentication errors
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set the loading state
       */
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'nexo-auth-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to get authentication state without subscribing to all changes
 */
export const getAuthState = () => useAuthStore.getState();

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Hook to get current user
 */
export const useCurrentUser = () => useAuthStore((state) => state.user);

/**
 * Hook to get authentication loading state
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

/**
 * Hook to get authentication error
 */
export const useAuthError = () => useAuthStore((state) => state.error);
