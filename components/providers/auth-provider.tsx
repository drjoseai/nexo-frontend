'use client';

/**
 * Authentication Provider for NEXO v2.0
 * 
 * Client component that validates auth state on mount and ensures
 * consistency between Zustand persist and TokenManager.
 * 
 * @module components/providers/auth-provider
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setIsInitialized] = useState(false);
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[AuthProvider] Initializing authentication...');
        
        await loadUser();
        
        if (mounted) {
          setIsInitialized(true);
          console.log('[AuthProvider] Authentication initialized');
        }
      } catch (error) {
        console.error('[AuthProvider] Initialization error:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [loadUser]);

  return <>{children}</>;
}

/**
 * Hook to access authentication state
 * Provides isAuthenticated and isLoading for redirect logic
 */
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  
  return { isAuthenticated, isLoading, user };
}

