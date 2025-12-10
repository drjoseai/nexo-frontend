/**
 * i18n Configuration for NEXO v2.0
 * Defines supported locales and default settings
 */

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇺🇸',
};

// Cookie name for storing user's locale preference
export const LOCALE_COOKIE_NAME = 'nexo_locale';

// Duration in days for locale cookie
export const LOCALE_COOKIE_MAX_AGE = 365;

