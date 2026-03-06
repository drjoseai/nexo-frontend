/**
 * Deep Links integration for NEXO using Capacitor 8.
 * Handles Universal Links (iOS) and App Links (Android).
 * @module lib/capacitor/deep-links
 */

import { isNative } from '@/src/lib/native';

export interface DeepLinkEvent {
  url: string;
  path: string;
  params: Record<string, string>;
}

export type DeepLinkHandler = (event: DeepLinkEvent) => void;

/**
 * Parse a deep link URL into path and params.
 */
function parseDeepLink(url: string): { path: string; params: Record<string, string> } {
  try {
    const parsed = new URL(url);
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return { path: parsed.pathname, params };
  } catch {
    return { path: url, params: {} };
  }
}

/**
 * Listen for deep link events.
 * Handles both app open from cold start and foreground deep links.
 * Returns cleanup function.
 */
export async function addDeepLinkListener(
  onDeepLink: DeepLinkHandler
): Promise<() => void> {
  if (!isNative()) return () => {};

  try {
    const { App } = await import('@capacitor/app');

    const listener = await App.addListener('appUrlOpen', (event) => {
      console.log('[DeepLinks] URL received:', event.url);
      const { path, params } = parseDeepLink(event.url);
      onDeepLink({ url: event.url, path, params });
    });

    const launchUrl = await App.getLaunchUrl();
    if (launchUrl?.url) {
      console.log('[DeepLinks] Launch URL:', launchUrl.url);
      const { path, params } = parseDeepLink(launchUrl.url);
      setTimeout(() => {
        onDeepLink({ url: launchUrl.url, path, params });
      }, 100);
    }

    return () => listener.remove();
  } catch (error) {
    console.error('[DeepLinks] Error setting up listener:', error);
    return () => {};
  }
}

/**
 * Check if a URL is a valid NEXO deep link.
 */
export function isNexoDeepLink(url: string): boolean {
  return url.startsWith('https://trynexo.ai') ||
    url.startsWith('https://app.trynexo.ai') ||
    url.startsWith('ai.trynexo.app://');
}
