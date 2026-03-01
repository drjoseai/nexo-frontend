/**
 * next-intl Server Configuration
 * Handles locale detection and message loading.
 *
 * In mobile/static export mode (NEXT_PUBLIC_IS_MOBILE=true):
 *   - Skips cookies() and headers() which are server-only APIs
 *   - Uses default locale at build time
 *   - Client-side locale switching is handled by NextIntlClientProvider
 *
 * In web/SSR mode (default):
 *   - Uses cookies and headers for server-side locale detection
 */

import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, Locale, LOCALE_COOKIE_NAME } from './config';

const isMobile = process.env.NEXT_PUBLIC_IS_MOBILE === 'true';

export default getRequestConfig(async () => {
  // === MOBILE/STATIC EXPORT MODE ===
  // At build time, use default locale. Client-side handles actual locale preference.
  if (isMobile) {
    return {
      locale: defaultLocale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default,
    };
  }

  // === WEB/SSR MODE (original logic) ===
  // Dynamic imports to avoid bundling server-only APIs in static export
  const { cookies, headers } = await import('next/headers');

  // 1. Check cookie preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value as Locale | undefined;

  if (cookieLocale && locales.includes(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`../messages/${cookieLocale}.json`)).default,
    };
  }

  // 2. Check Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().substring(0, 2))
      .filter((lang): lang is Locale => locales.includes(lang as Locale));

    if (preferredLocales.length > 0) {
      const detectedLocale = preferredLocales[0];
      return {
        locale: detectedLocale,
        messages: (await import(`../messages/${detectedLocale}.json`)).default,
      };
    }
  }

  // 3. Fall back to default locale (Spanish for LATAM market)
  return {
    locale: defaultLocale,
    messages: (await import(`../messages/${defaultLocale}.json`)).default,
  };
});
