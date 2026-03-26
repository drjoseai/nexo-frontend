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
import { analytics, AnalyticsEvents } from '@/lib/services/analytics';
import { identifyUser as rcIdentify, logOutRevenueCat } from '@/lib/capacitor/revenuecat';

/**
 * Initial authentication state
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,  // Inicia en true para evitar race condition con redirect en DashboardLayout
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

          // Track login event and identify user
          analytics.identify(user.id, {
            email: user.email,
            plan: user.plan,
            language: user.preferred_language,
            display_name: user.display_name,
          });
          analytics.track(AnalyticsEvents.USER_LOGGED_IN, {
            plan: user.plan,
          });

          // Initialize RevenueCat first, then identify user
          try {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
              const { initRevenueCat } = await import('@/lib/capacitor/revenuecat');
              await initRevenueCat(user.id);
            }
          } catch {
            // Best-effort
          }
          rcIdentify(user.id).catch(() => {});

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

          // Track registration event (user will be identified after auto-login)
          analytics.track(AnalyticsEvents.USER_REGISTERED, {
            language: data.preferred_language || 'es',
          });

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
          // Track logout event before resetting analytics
          analytics.track(AnalyticsEvents.USER_LOGGED_OUT);
          analytics.reset();

          // Call backend logout endpoint to clear httpOnly cookies
          await authApi.logout();

          logOutRevenueCat().catch(() => {});
          
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

          // CRITICAL FIX: On native platforms, check for stored token FIRST.
          // If no token exists in Preferences, user is definitely not authenticated.
          // Skip the API call entirely to avoid hanging on fresh installs.
          if (typeof window !== 'undefined') {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
              const { Preferences } = await import('@capacitor/preferences');
              const { value: storedToken } = await Preferences.get({ key: 'nexo_access_token' });
              if (!storedToken) {
                console.log('[AuthStore] Native: no stored token found, skipping API call');
                set({ ...initialState, isLoading: false });
                return;
              }
              console.log('[AuthStore] Native: stored token found, verifying with backend...');
            }
          }

          set({ isLoading: true, error: null });

          // Fetch current user with a timeout safety net (8 seconds max).
          // This prevents infinite loading if backend is slow (e.g. Render cold start).
          const user = await Promise.race([
            authApi.getCurrentUser(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Auth timeout: backend took too long')), 8000)
            ),
          ]);

          // Update state with user data
          set({
            user,
            token: null,
            isAuthenticated: true,
            error: null,
          });

          // Initialize RevenueCat on native platforms after user is confirmed
          try {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
              const { initRevenueCat } = await import('@/lib/capacitor/revenuecat');
              await initRevenueCat(user.id);
            }
          } catch {
            // RevenueCat init is best-effort - never block auth flow
          }

          rcIdentify(user.id).catch(() => {});

          console.log('[AuthStore] User loaded successfully:', user.email);
        } catch (error) {
          console.log('[AuthStore] Failed to load user (not authenticated or timeout):', error);

          // On native timeout or error: clear token if it's invalid
          if (typeof window !== 'undefined') {
            const { Capacitor } = await import('@capacitor/core');
            if (Capacitor.isNativePlatform()) {
              const { Preferences } = await import('@capacitor/preferences');
              await Preferences.remove({ key: 'nexo_access_token' }).catch(() => {});
              console.log('[AuthStore] Native: cleared invalid/expired token');
            }
          }

          // Clear state - user goes to login
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
