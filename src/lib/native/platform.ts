/**
 * Native Platform Detection for NEXO
 * 
 * Detects whether the app is running as:
 * - Web (browser/PWA on Vercel)
 * - iOS (Capacitor native app)
 * - Android (Capacitor native app)
 * 
 * Used to conditionally enable native features like IAP, 
 * push notifications, haptics, etc.
 */

import { Capacitor } from '@capacitor/core';

export type NexoPlatform = 'web' | 'ios' | 'android';

/**
 * Get the current platform the app is running on
 */
export function getPlatform(): NexoPlatform {
  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
  }
  return 'web';
}

/**
 * Check if running as a native app (iOS or Android)
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}

/**
 * Check if running on web (browser/PWA)
 */
export function isWeb(): boolean {
  return !Capacitor.isNativePlatform();
}

/**
 * Check if a specific Capacitor plugin is available
 * Useful for graceful degradation when a plugin isn't installed
 */
export function isPluginAvailable(pluginName: string): boolean {
  return Capacitor.isPluginAvailable(pluginName);
}

/**
 * Get the appropriate payment method for the current platform
 * - iOS: Apple IAP via RevenueCat
 * - Android: Google IAP via RevenueCat  
 * - Web: Stripe
 */
export type PaymentProvider = 'revenuecat' | 'stripe';

export function getPaymentProvider(): PaymentProvider {
  if (isNative()) return 'revenuecat';
  return 'stripe';
}

/**
 * Get the base API URL - same for all platforms
 * Native apps communicate with the same backend as web
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://nexo-v2-core.onrender.com';
}
