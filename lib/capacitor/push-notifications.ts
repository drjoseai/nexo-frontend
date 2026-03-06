/**
 * Push Notifications integration for NEXO using Capacitor 8.
 * Handles registration, permission requests, and notification events.
 * Only active on native platforms (iOS/Android).
 * @module lib/capacitor/push-notifications
 */

import { isNative, isIOS } from '@/src/lib/native';

export interface PushNotificationToken {
  value: string;
  platform: 'ios' | 'android';
}

export interface PushNotificationPayload {
  id: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
  badge?: number;
}

export type PushNotificationHandler = (notification: PushNotificationPayload) => void;
export type PushTokenHandler = (token: PushNotificationToken) => void;
export type PushErrorHandler = (error: Error) => void;

/**
 * Check if push notifications are available (native platforms only)
 */
export function isPushNotificationsAvailable(): boolean {
  return isNative();
}

/**
 * Request push notification permissions from the user.
 * Returns true if granted, false if denied.
 */
export async function requestPushPermissions(): Promise<boolean> {
  if (!isNative()) return false;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.requestPermissions();
    return result.receive === 'granted';
  } catch (error) {
    console.error('[PushNotifications] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Check current push notification permission status.
 */
export async function checkPushPermissions(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!isNative()) return 'denied';

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const result = await PushNotifications.checkPermissions();
    if (result.receive === 'granted') return 'granted';
    if (result.receive === 'denied') return 'denied';
    return 'prompt';
  } catch (error) {
    console.error('[PushNotifications] Error checking permissions:', error);
    return 'denied';
  }
}

/**
 * Register device for push notifications.
 * Must be called after permissions are granted.
 * Returns a cleanup function to remove listeners.
 */
export async function registerForPushNotifications(
  onToken: PushTokenHandler,
  onError: PushErrorHandler
): Promise<() => void> {
  if (!isNative()) return () => {};

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const registrationListener = await PushNotifications.addListener(
      'registration',
      (token) => {
        const platform = isIOS() ? 'ios' : 'android';
        console.log('[PushNotifications] Token received:', token.value);
        onToken({ value: token.value, platform });
      }
    );

    const errorListener = await PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('[PushNotifications] Registration error:', error);
        onError(new Error(error.error));
      }
    );

    await PushNotifications.register();

    return () => {
      registrationListener.remove();
      errorListener.remove();
    };
  } catch (error) {
    console.error('[PushNotifications] Error registering:', error);
    onError(error instanceof Error ? error : new Error('Registration failed'));
    return () => {};
  }
}

/**
 * Listen for incoming push notifications (app in foreground).
 * Returns a cleanup function to remove the listener.
 */
export async function addPushNotificationListener(
  onNotification: PushNotificationHandler
): Promise<() => void> {
  if (!isNative()) return () => {};

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const listener = await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        onNotification({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          data: notification.data as Record<string, unknown>,
          badge: notification.badge,
        });
      }
    );

    return () => listener.remove();
  } catch (error) {
    console.error('[PushNotifications] Error adding listener:', error);
    return () => {};
  }
}

/**
 * Listen for notification tap events (user taps on notification).
 * Returns a cleanup function to remove the listener.
 */
export async function addNotificationActionListener(
  onAction: PushNotificationHandler
): Promise<() => void> {
  if (!isNative()) return () => {};

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    const listener = await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action) => {
        onAction({
          id: action.notification.id,
          title: action.notification.title,
          body: action.notification.body,
          data: action.notification.data as Record<string, unknown>,
        });
      }
    );

    return () => listener.remove();
  } catch (error) {
    console.error('[PushNotifications] Error adding action listener:', error);
    return () => {};
  }
}

/**
 * Clear all delivered notifications from notification center.
 */
export async function clearAllNotifications(): Promise<void> {
  if (!isNative()) return;

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    await PushNotifications.removeAllDeliveredNotifications();
  } catch (error) {
    console.error('[PushNotifications] Error clearing notifications:', error);
  }
}
