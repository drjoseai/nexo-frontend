'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, AnalyticsEvents } from '@/lib/services/analytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    analytics.init();
  }, []);

  useEffect(() => {
    if (pathname) {
      analytics.track(AnalyticsEvents.PAGE_VIEWED, {
        page: pathname,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
