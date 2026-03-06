'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { analytics, AnalyticsEvents } from '@/lib/services/analytics';
import { useCookieConsent } from '@/lib/hooks/use-cookie-consent';
import { useNativePlatform } from '@/lib/hooks/use-native-platform';
import { requestATTPermission, isTrackingAuthorized } from '@/lib/capacitor/att';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { analyticsConsent, loaded } = useCookieConsent();
  const { isIOSApp } = useNativePlatform();
  const [attChecked, setAttChecked] = useState(false);

  useEffect(() => {
    if (!loaded || !analyticsConsent) return;

    const initAnalytics = async () => {
      if (isIOSApp) {
        const status = await requestATTPermission();
        if (isTrackingAuthorized(status)) {
          await analytics.init();
        } else {
          await analytics.initAnonymous();
        }
      } else {
        await analytics.init();
      }
      setAttChecked(true);
    };

    initAnalytics();
  }, [loaded, analyticsConsent, isIOSApp]);

  useEffect(() => {
    if (pathname && analyticsConsent && attChecked) {
      analytics.track(AnalyticsEvents.PAGE_VIEWED, { page: pathname });
    }
  }, [pathname, analyticsConsent, attChecked]);

  return <>{children}</>;
}
