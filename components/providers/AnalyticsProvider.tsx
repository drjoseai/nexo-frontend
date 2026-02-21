'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, AnalyticsEvents } from '@/lib/services/analytics';
import { useCookieConsent } from '@/lib/hooks/use-cookie-consent';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { analyticsConsent, loaded } = useCookieConsent();

  useEffect(() => {
    if (loaded && analyticsConsent) {
      analytics.init();
    }
  }, [loaded, analyticsConsent]);

  useEffect(() => {
    if (pathname && analyticsConsent) {
      analytics.track(AnalyticsEvents.PAGE_VIEWED, {
        page: pathname,
      });
    }
  }, [pathname, analyticsConsent]);

  return <>{children}</>;
}
