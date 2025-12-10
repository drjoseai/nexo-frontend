/**
 * next-intl Server Configuration
 * Handles locale detection and message loading
 */

import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, Locale, LOCALE_COOKIE_NAME } from './config';

export default getRequestConfig(async () => {
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
    // Parse Accept-Language header (e.g., "es-ES,es;q=0.9,en;q=0.8")
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

