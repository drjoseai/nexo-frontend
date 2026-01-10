/**
 * Authentication Store for NEXO v2.0
 * 
 * Manages global authentication state using Zustand with persistence.
 * Integrates with TokenManager for automatic token refresh.
 * 
 * @module lib/store/auth
 */

import { create } from 'zustand';
import type { AuthStore, LoginRequest, RegisterRequest } from '@/types/auth';
import * as authApi from '@/lib/api/auth';
import { tokenManager } from '@/lib/services/token-manager';
import { toast } from '@/lib/services/toast-service';

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
 * Simplified for httpOnly cookie authentication.
 * No persistence needed - backend manages session via cookies.
 * State is loaded fresh on each page load via loadUser().
 */
export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...initialState,

      /**
       * Authenticate a user with email and password
       * Backend sets httpOnly cookies automatically via Set-Cookie headers
       */
      login: async (credentials: LoginRequest) => {
        const toastId = toast.loading('Iniciando sesión...');
        
        try {
          set({ isLoading: true, error: null });

          // Backend returns user object directly and sets httpOnly cookies
          const user = await authApi.login(credentials);

          // Backend sets httpOnly cookies (nexo_access_token, nexo_refresh_token)
          // No need to store tokens manually - browser handles it automatically

          // Update store state with user data
          set({
            user,
            token: null, // Token not stored in frontend anymore
            isAuthenticated: true,
            error: null,
          });

          toast.dismiss(toastId);
          toast.success(`¡Bienvenido, ${user.display_name || user.email}!`);
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
       * Backend clears httpOnly cookies via logout endpoint
       * 
       * NOTE: Redirect should be handled by the component calling this function,
       * not by the store itself, to avoid conflicts with Next.js routing.
       */
      logout: async () => {
        try {
          // Call backend logout endpoint to clear httpOnly cookies
          await authApi.logout();
          
          // Reset state to initial values
          set(initialState);
          
          toast.info('Sesión cerrada');
        } catch (error) {
          console.warn('Logout API call failed:', error);
          
          // Clear state anyway even if API call fails
          set(initialState);
          
          toast.info('Sesión cerrada');
        }
      },

      /**
       * Load user data from backend
       * 
       * Simplified for httpOnly cookie authentication.
       * Backend verifies cookies and returns user data or 401.
       */
      loadUser: async () => {
        try {
          if (typeof window === 'undefined') {
            return;
          }

          console.log('[AuthStore] Loading user from backend...');

          // Initialize TokenManager (registers callbacks)
          tokenManager.initialize();

          // Register logout callback
          tokenManager.onLogout(() => {
            console.log('[AuthStore] TokenManager triggered logout');
            set(initialState);
          });

          set({ isLoading: true, error: null });

          // Fetch current user data
          // Backend verifies httpOnly cookies automatically
          // Returns user data if valid, or 401 if not authenticated
          const user = await authApi.getCurrentUser();

          // Update state with user data
          set({
            user,
            token: null, // Token not stored in frontend
            isAuthenticated: true,
            error: null,
          });

          console.log('[AuthStore] User loaded successfully:', user.email);
        } catch (error: unknown) {
          console.log('[AuthStore] Failed to load user (not authenticated)');
          
          // Clear state if not authenticated
          set(initialState);
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
    }));

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
