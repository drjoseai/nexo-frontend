'use client';

import { useEffect } from 'react';
import { analytics } from '@/lib/services/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize analytics (now async)
    analytics.init();
  }, []);

  return <>{children}</>;
}
