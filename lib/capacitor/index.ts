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

export {
  isPushNotificationsAvailable,
  requestPushPermissions,
  checkPushPermissions,
  registerForPushNotifications,
  addPushNotificationListener,
  addNotificationActionListener,
  clearAllNotifications,
} from './push-notifications';

export type {
  PushNotificationToken,
  PushNotificationPayload,
  PushTokenHandler,
  PushNotificationHandler,
  PushErrorHandler,
} from './push-notifications';

export {
  addDeepLinkListener,
  isNexoDeepLink,
} from './deep-links';

export type { DeepLinkEvent, DeepLinkHandler } from './deep-links';
