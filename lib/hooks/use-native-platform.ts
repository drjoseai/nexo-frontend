/**
 * React hook for native platform detection.
 * 
 * Wraps the platform detection utilities from src/lib/native/platform.ts
 * in a React-friendly hook that can be used in components.
 * 
 * Uses useSyncExternalStore for SSR-safe, React Compiler-compatible
 * platform detection without useState/useEffect.
 * 
 * @module lib/hooks/use-native-platform
 */

import { useSyncExternalStore } from 'react';
import {
  isNative,
  isIOS,
  isAndroid,
  isWeb,
  getPaymentProvider,
  getPlatform,
} from '@/src/lib/native';
import type { NexoPlatform, PaymentProvider } from '@/src/lib/native';

export interface NativePlatformInfo {
  /** Current platform: 'web' | 'ios' | 'android' */
  platform: NexoPlatform;
  /** Whether running as native app (iOS or Android) */
  isNativeApp: boolean;
  /** Whether running on iOS */
  isIOSApp: boolean;
  /** Whether running on Android */
  isAndroidApp: boolean;
  /** Whether running on web (browser/PWA) */
  isWebApp: boolean;
  /** Payment provider for current platform: 'revenuecat' | 'stripe' */
  paymentProvider: PaymentProvider;
  /** Whether platform detection has completed */
  isReady: boolean;
}

/** Platform never changes at runtime, so subscribe is a no-op */
const emptySubscribe = () => () => {};

/** SSR snapshot — defaults to web */
const serverSnapshot: NativePlatformInfo = {
  platform: 'web',
  isNativeApp: false,
  isIOSApp: false,
  isAndroidApp: false,
  isWebApp: true,
  paymentProvider: 'stripe',
  isReady: false,
};

/** Cached client snapshot (computed once, platform is stable) */
let clientSnapshot: NativePlatformInfo | null = null;

function getClientSnapshot(): NativePlatformInfo {
  if (!clientSnapshot) {
    clientSnapshot = {
      platform: getPlatform(),
      isNativeApp: isNative(),
      isIOSApp: isIOS(),
      isAndroidApp: isAndroid(),
      isWebApp: isWeb(),
      paymentProvider: getPaymentProvider(),
      isReady: true,
    };
  }
  return clientSnapshot;
}

function getServerSnapshot(): NativePlatformInfo {
  return serverSnapshot;
}

/**
 * Hook to detect the current platform and determine native capabilities.
 * 
 * @example
 * ```tsx
 * const { isNativeApp, paymentProvider, isIOSApp } = useNativePlatform();
 * 
 * if (paymentProvider === 'revenuecat') {
 *   // Show native IAP paywall
 * } else {
 *   // Show Stripe checkout
 * }
 * ```
 */
export function useNativePlatform(): NativePlatformInfo {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}
