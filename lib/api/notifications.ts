/**
 * Notifications API client for NEXO v2.0
 * Handles device token registration for push notifications.
 * @module lib/api/notifications
 */

import { apiClient } from '@/lib/api/client';

export interface RegisterDeviceTokenRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
}

export interface RegisterDeviceTokenResponse {
  success: boolean;
  message: string;
}

/**
 * Register a device push token with the backend.
 * Called after successful login when push permission is granted.
 */
export async function registerDeviceToken(
  payload: RegisterDeviceTokenRequest
): Promise<RegisterDeviceTokenResponse> {
  const response = await apiClient.post<RegisterDeviceTokenResponse>(
    '/api/v1/notifications/register-device',
    payload
  );
  return response.data;
}
