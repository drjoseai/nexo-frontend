/**
 * React hook for RevenueCat IAP operations.
 * 
 * Provides methods to interact with RevenueCat for
 * in-app purchases on native platforms (iOS/Android).
 * 
 * On web, all operations are no-ops and the hook returns
 * default values indicating IAP is not available.
 * 
 * @module lib/hooks/use-revenuecat
 */

import { useState, useCallback } from 'react';
import { isNative } from '@/src/lib/native';
import {
  initRevenueCat,
  identifyUser,
  getCustomerInfo,
  restorePurchases,
  isRevenueCatAvailable,
} from '@/lib/capacitor/revenuecat';
import type { CustomerInfo } from '@revenuecat/purchases-capacitor';

export interface RevenueCatState {
  /** Whether RevenueCat is available (native platform + initialized) */
  isAvailable: boolean;
  /** Whether an operation is in progress */
  isLoading: boolean;
  /** Current customer info */
  customerInfo: CustomerInfo | null;
  /** Error message from last operation */
  error: string | null;
  /** Whether user has an active entitlement */
  hasActiveSubscription: boolean;
  /** Active entitlement IDs */
  activeEntitlements: string[];
}

export interface RevenueCatActions {
  /** Initialize RevenueCat with user ID */
  initialize: (userId?: string) => Promise<void>;
  /** Identify user after login */
  identify: (userId: string) => Promise<void>;
  /** Show native paywall (RevenueCatUI) */
  presentPaywall: () => Promise<boolean>;
  /** Show paywall only if user doesn't have required entitlement */
  presentPaywallIfNeeded: (entitlementId: string) => Promise<boolean>;
  /** Restore previous purchases */
  restore: () => Promise<void>;
  /** Refresh customer info */
  refreshCustomerInfo: () => Promise<void>;
}

/**
 * Hook for RevenueCat IAP operations.
 * 
 * @example
 * ```tsx
 * const { isAvailable, hasActiveSubscription, presentPaywall, restore } = useRevenueCat();
 * 
 * const handleSubscribe = async () => {
 *   if (isAvailable) {
 *     await presentPaywall();
 *   }
 * };
 * ```
 */
export function useRevenueCat(): RevenueCatState & RevenueCatActions {
  const [state, setState] = useState<RevenueCatState>({
    isAvailable: false,
    isLoading: false,
    customerInfo: null,
    error: null,
    hasActiveSubscription: false,
    activeEntitlements: [],
  });

  /** Extract subscription state from CustomerInfo */
  const updateFromCustomerInfo = useCallback((info: CustomerInfo | null) => {
    if (!info) {
      setState(prev => ({
        ...prev,
        customerInfo: null,
        hasActiveSubscription: false,
        activeEntitlements: [],
      }));
      return;
    }

    const activeEntitlements = Object.keys(info.entitlements?.active || {});

    setState(prev => ({
      ...prev,
      customerInfo: info,
      hasActiveSubscription: activeEntitlements.length > 0,
      activeEntitlements,
    }));
  }, []);

  /** Initialize RevenueCat SDK */
  const initialize = useCallback(async (userId?: string) => {
    if (!isNative()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await initRevenueCat(userId);
      const info = await getCustomerInfo();
      updateFromCustomerInfo(info);
      setState(prev => ({ ...prev, isAvailable: isRevenueCatAvailable(), isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize RevenueCat',
      }));
    }
  }, [updateFromCustomerInfo]);

  /** Identify user after login */
  const identify = useCallback(async (userId: string) => {
    if (!isRevenueCatAvailable()) return;
    try {
      await identifyUser(userId);
      const info = await getCustomerInfo();
      updateFromCustomerInfo(info);
    } catch (error) {
      console.error('[useRevenueCat] Failed to identify user:', error);
    }
  }, [updateFromCustomerInfo]);

  /** Present native paywall via RevenueCatUI */
  const presentPaywall = useCallback(async (): Promise<boolean> => {
    if (!isRevenueCatAvailable()) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
      const { PAYWALL_RESULT } = await import('@revenuecat/purchases-typescript-internal-esm');
      const paywallResult = await RevenueCatUI.presentPaywall();

      const info = await getCustomerInfo();
      updateFromCustomerInfo(info);
      setState(prev => ({ ...prev, isLoading: false }));

      return paywallResult.result === PAYWALL_RESULT.PURCHASED || paywallResult.result === PAYWALL_RESULT.RESTORED;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Paywall failed',
      }));
      return false;
    }
  }, [updateFromCustomerInfo]);

  /** Present paywall only if user lacks the specified entitlement */
  const presentPaywallIfNeeded = useCallback(async (entitlementId: string): Promise<boolean> => {
    if (!isRevenueCatAvailable()) return false;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const { RevenueCatUI } = await import('@revenuecat/purchases-capacitor-ui');
      const { PAYWALL_RESULT } = await import('@revenuecat/purchases-typescript-internal-esm');
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: entitlementId,
      });

      const info = await getCustomerInfo();
      updateFromCustomerInfo(info);
      setState(prev => ({ ...prev, isLoading: false }));

      return paywallResult.result === PAYWALL_RESULT.PURCHASED || paywallResult.result === PAYWALL_RESULT.RESTORED;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Paywall failed',
      }));
      return false;
    }
  }, [updateFromCustomerInfo]);

  /** Restore previous purchases */
  const restore = useCallback(async () => {
    if (!isRevenueCatAvailable()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const info = await restorePurchases();
      updateFromCustomerInfo(info);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Restore failed',
      }));
    }
  }, [updateFromCustomerInfo]);

  /** Refresh customer info */
  const refreshCustomerInfo = useCallback(async () => {
    if (!isRevenueCatAvailable()) return;
    const info = await getCustomerInfo();
    updateFromCustomerInfo(info);
  }, [updateFromCustomerInfo]);

  return {
    ...state,
    initialize,
    identify,
    presentPaywall,
    presentPaywallIfNeeded,
    restore,
    refreshCustomerInfo,
  };
}
