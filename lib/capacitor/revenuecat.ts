/**
 * RevenueCat SDK Initialization for NEXO
 * 
 * Initializes RevenueCat Purchases SDK on native platforms (iOS/Android).
 * On web, RevenueCat is not used — Stripe handles payments.
 * 
 * RevenueCat manages:
 * - In-App Purchases (Apple IAP + Google Play)
 * - Native paywall presentation (RevenueCatUI)
 * - Subscription status tracking
 * - Receipt validation
 * 
 * @module lib/capacitor/revenuecat
 */

import { Capacitor } from '@capacitor/core';
import { isNative } from '@/src/lib/native';
import type { CustomerInfo, PurchasesPackage } from '@revenuecat/purchases-capacitor';

/** Track initialization state */
let isInitialized = false;

/**
 * Initialize RevenueCat SDK.
 * Must be called once on app startup, only on native platforms.
 * 
 * @param userId - NEXO user ID to identify the subscriber in RevenueCat
 */
export async function initRevenueCat(userId?: string): Promise<void> {
  if (!isNative()) {
    console.log('[RevenueCat] Skipping init — not a native platform');
    return;
  }

  if (isInitialized) {
    console.log('[RevenueCat] Already initialized');
    return;
  }

  const platform = Capacitor.getPlatform();
  const apiKey = platform === 'android'
    ? process.env.NEXT_PUBLIC_REVENUECAT_ANDROID_API_KEY!
    : process.env.NEXT_PUBLIC_REVENUECAT_API_KEY!;

  if (!apiKey) {
    console.error(`[RevenueCat] Missing API key for platform: ${platform}`);
    return;
  }

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');

    await Purchases.configure({
      apiKey,
      appUserID: userId || undefined,
    });

    if (process.env.NODE_ENV === 'development') {
      const { LOG_LEVEL } = await import('@revenuecat/purchases-typescript-internal-esm');
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    }

    isInitialized = true;
  } catch (error) {
    console.error('[RevenueCat] Initialization failed:', error);
  }
}

/**
 * Identify user in RevenueCat after login.
 * Links the NEXO user ID to RevenueCat subscriber.
 * 
 * @param userId - NEXO user ID
 */
export async function identifyUser(userId: string): Promise<void> {
  if (!isNative() || !isInitialized) return;

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logIn({ appUserID: userId });
  } catch (error) {
    console.error('[RevenueCat] Failed to identify user:', error);
  }
}

/**
 * Log out user from RevenueCat.
 * Creates a new anonymous user in RevenueCat.
 */
export async function logOutRevenueCat(): Promise<void> {
  if (!isNative() || !isInitialized) return;

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    await Purchases.logOut();
    console.log('[RevenueCat] User logged out');
  } catch (error) {
    console.error('[RevenueCat] Failed to log out:', error);
  }
}

/**
 * Get current customer info from RevenueCat.
 * Contains active subscriptions, entitlements, etc.
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isNative() || !isInitialized) return null;

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to get customer info:', error);
    return null;
  }
}

/**
 * Get available offerings (products/packages) from RevenueCat.
 */
export async function getOfferings() {
  if (!isNative() || !isInitialized) return null;

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('[RevenueCat] Failed to get offerings:', error);
    return null;
  }
}

/**
 * Purchase a package from RevenueCat.
 * 
 * @param packageToPurchase - The full PurchasesPackage object from offerings
 * @returns CustomerInfo after purchase, or null if failed/canceled
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> {
  if (!isNative() || !isInitialized) return null;

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });
    return customerInfo;
  } catch (error: unknown) {
    const rcError = error as { code?: number; userCancelled?: boolean };
    if (rcError.userCancelled) {
      console.log('[RevenueCat] Purchase cancelled by user');
      return null;
    }
    console.error('[RevenueCat] Purchase failed:', error);
    throw error;
  }
}

/**
 * Restore previous purchases.
 * Useful when user reinstalls app or switches devices.
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isNative() || !isInitialized) return null;

  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    const { customerInfo } = await Purchases.restorePurchases();
    console.log('[RevenueCat] Purchases restored');
    return customerInfo;
  } catch (error) {
    console.error('[RevenueCat] Failed to restore purchases:', error);
    throw error;
  }
}

/**
 * Check if RevenueCat is initialized and available.
 */
export function isRevenueCatAvailable(): boolean {
  return isNative() && isInitialized;
}
