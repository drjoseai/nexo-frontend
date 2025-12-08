/**
 * Authentication Store for NEXO v2.0
 * 
 * Manages global authentication state using Zustand with persistence.
 * Handles login, registration, logout, and user session management.
 * 
 * @module lib/store/auth
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, LoginRequest, RegisterRequest } from '@/types/auth';
import * as authApi from '@/lib/api/auth';

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
 * All authentication operations are handled through this store.
 * 
 * @example
 * ```tsx
 * import { useAuthStore } from '@/lib/store/auth';
 * 
 * function LoginButton() {
 *   const { login, isLoading } = useAuthStore();
 *   
 *   const handleLogin = async () => {
 *     await login({ email: 'user@example.com', password: 'password' });
 *   };
 *   
 *   return <button onClick={handleLogin} disabled={isLoading}>Login</button>;
 * }
 * ```
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Authenticate a user with email and password
       * 
       * @param credentials - User login credentials
       * @throws Will set error state if login fails
       */
      login: async (credentials: LoginRequest) => {
        try {
          // Clear any previous errors and set loading state
          set({ isLoading: true, error: null });

          // Call login API
          const response = await authApi.login(credentials);

          // Store token and user in localStorage (for SSR compatibility)
          if (typeof window !== 'undefined') {
            localStorage.setItem('nexo_token', response.access_token);
            localStorage.setItem('nexo_user', JSON.stringify(response.user));
          }

          // Update store state
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          // Set error message
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Error al iniciar sesión. Por favor, intenta de nuevo.';
          
          set({ 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          // Re-throw for component-level error handling if needed
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Register a new user account
       * 
       * After successful registration, automatically logs in the user.
       * 
       * @param data - User registration data
       * @throws Will set error state if registration fails
       */
      register: async (data: RegisterRequest) => {
        try {
          // Clear any previous errors and set loading state
          set({ isLoading: true, error: null });

          // Call register API
          await authApi.register(data);

          // After successful registration, automatically log in
          await get().login({
            email: data.email,
            password: data.password,
          });
        } catch (error: any) {
          // Set error message
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             'Error al registrar usuario. Por favor, intenta de nuevo.';
          
          set({ 
            error: errorMessage,
            isAuthenticated: false,
            user: null,
            token: null,
          });

          // Re-throw for component-level error handling if needed
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * Log out the current user
       * 
       * Clears authentication state and removes tokens from localStorage.
       * Calls the logout API endpoint to invalidate the token on the server.
       */
      logout: () => {
        // Call logout API (fire and forget)
        authApi.logout().catch((error) => {
          console.warn('Logout API call failed:', error);
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nexo_token');
          localStorage.removeItem('nexo_user');
        }

        // Reset state to initial values
        set(initialState);
      },

      /**
       * Load user data from stored token
       * 
       * Attempts to restore user session by fetching current user data
       * using the stored token. If the token is invalid or expired,
       * logs out the user.
       * 
       * Should be called on app initialization to restore user session.
       */
      loadUser: async () => {
        try {
          // Check if we're in a browser environment
          if (typeof window === 'undefined') {
            return;
          }

          // Get token from localStorage
          const token = localStorage.getItem('nexo_token');
          
          if (!token) {
            // No token found, ensure state is cleared
            set(initialState);
            return;
          }

          // Set loading state
          set({ isLoading: true, error: null });

          // Fetch current user data
          const user = await authApi.getCurrentUser();

          // Update store state
          set({
            user,
            token,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          // Token is invalid or expired, log out
          console.warn('Failed to load user, logging out:', error);
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
       * 
       * @param isLoading - New loading state
       */
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'nexo-auth-storage',
      storage: createJSONStorage(() => {
        // Handle SSR - return a no-op storage when window is undefined
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Only persist specific fields
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
 * Useful for getting specific state values without causing re-renders
 */
export const getAuthState = () => useAuthStore.getState();

/**
 * Hook to check if user is authenticated
 * Returns only the authentication status
 */
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

/**
 * Hook to get current user
 * Returns only the user object
 */
export const useCurrentUser = () => useAuthStore((state) => state.user);

/**
 * Hook to get authentication loading state
 * Returns only the loading status
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

/**
 * Hook to get authentication error
 * Returns only the error message
 */
export const useAuthError = () => useAuthStore((state) => state.error);

