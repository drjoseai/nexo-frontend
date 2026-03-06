/**
 * React hook for Push Notifications in NEXO.
 * Manages permission state, token registration, and notification events.
 * Safe for SSR — returns inert state on web/server.
 * @module lib/hooks/use-push-notifications
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isPushNotificationsAvailable,
  requestPushPermissions,
  checkPushPermissions,
  registerForPushNotifications,
  addPushNotificationListener,
  addNotificationActionListener,
  clearAllNotifications,
  type PushNotificationPayload,
  type PushNotificationToken,
} from '@/lib/capacitor/push-notifications';

export interface UsePushNotificationsState {
  /** Whether push notifications are supported on this platform */
  isAvailable: boolean;
  /** Current permission status */
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
  /** Device push token (available after successful registration) */
  token: PushNotificationToken | null;
  /** Whether registration is in progress */
  isRegistering: boolean;
  /** Last received notification (foreground) */
  lastNotification: PushNotificationPayload | null;
  /** Last notification action (user tapped) */
  lastAction: PushNotificationPayload | null;
  /** Any error that occurred */
  error: string | null;
}

export interface UsePushNotificationsActions {
  /** Request permission and register for push notifications */
  registerPush: () => Promise<boolean>;
  /** Clear all delivered notifications */
  clearNotifications: () => Promise<void>;
  /** Reset error state */
  clearError: () => void;
}

export type UsePushNotificationsResult = UsePushNotificationsState & UsePushNotificationsActions;

const initialState: UsePushNotificationsState = {
  isAvailable: false,
  permissionStatus: 'unknown',
  token: null,
  isRegistering: false,
  lastNotification: null,
  lastAction: null,
  error: null,
};

/**
 * Hook to manage push notifications in NEXO.
 *
 * @param options.onToken - Callback when device token is received
 * @param options.onNotification - Callback when notification is received in foreground
 * @param options.onAction - Callback when user taps a notification
 * @param options.autoRegister - Automatically register if permissions already granted
 *
 * @example
 * ```tsx
 * const { permissionStatus, registerPush, token } = usePushNotifications({
 *   onToken: (token) => sendTokenToBackend(token),
 *   onAction: (notification) => router.push(notification.data?.path as string),
 * });
 * ```
 */
export function usePushNotifications(options?: {
  onToken?: (token: PushNotificationToken) => void;
  onNotification?: (notification: PushNotificationPayload) => void;
  onAction?: (notification: PushNotificationPayload) => void;
  autoRegister?: boolean;
}): UsePushNotificationsResult {
  const [state, setState] = useState<UsePushNotificationsState>(initialState);
  const cleanupRef = useRef<Array<() => void>>([]);
  const mountedRef = useRef(true);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const updateState = useCallback((updates: Partial<UsePushNotificationsState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const init = async () => {
      const available = isPushNotificationsAvailable();
      if (!available) {
        updateState({ isAvailable: false, permissionStatus: 'denied' });
        return;
      }

      const status = await checkPushPermissions();
      updateState({ isAvailable: true, permissionStatus: status });

      const cleanupNotification = await addPushNotificationListener((notification) => {
        updateState({ lastNotification: notification });
        optionsRef.current?.onNotification?.(notification);
      });
      cleanupRef.current.push(cleanupNotification);

      const cleanupAction = await addNotificationActionListener((notification) => {
        updateState({ lastAction: notification });
        optionsRef.current?.onAction?.(notification);
      });
      cleanupRef.current.push(cleanupAction);
    };

    init();

    return () => {
      mountedRef.current = false;
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, [updateState]);

  const registerPush = useCallback(async (): Promise<boolean> => {
    if (!isPushNotificationsAvailable()) return false;

    updateState({ isRegistering: true, error: null });

    try {
      const granted = await requestPushPermissions();
      if (!granted) {
        updateState({
          isRegistering: false,
          permissionStatus: 'denied',
          error: 'Push notification permissions denied',
        });
        return false;
      }

      updateState({ permissionStatus: 'granted' });

      const cleanup = await registerForPushNotifications(
        (token) => {
          updateState({ token, isRegistering: false });
          optionsRef.current?.onToken?.(token);
        },
        (error) => {
          updateState({
            isRegistering: false,
            error: error.message,
          });
        }
      );
      cleanupRef.current.push(cleanup);

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      updateState({ isRegistering: false, error: message });
      return false;
    }
  }, [updateState]);

  const clearNotifications = useCallback(async () => {
    await clearAllNotifications();
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    ...state,
    registerPush,
    clearNotifications,
    clearError,
  };
}
