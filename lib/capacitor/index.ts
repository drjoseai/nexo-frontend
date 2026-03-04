/**
 * Capacitor integration modules for NEXO
 * @module lib/capacitor
 */

export {
  initRevenueCat,
  identifyUser,
  logOutRevenueCat,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  isRevenueCatAvailable,
} from './revenuecat';

export {
  isAppleSignInAvailable,
  appleSignIn,
} from './apple-auth';

export type { AppleSignInResult } from './apple-auth';
