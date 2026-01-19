'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/services/analytics';

/**
 * Analytics Provider Component
 * 
 * Initializes Mixpanel analytics on app load.
 * Must be rendered client-side as Mixpanel requires browser APIs.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    analytics.init();
  }, []);

  return <>{children}</>;
}

