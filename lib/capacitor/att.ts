/**
 * App Tracking Transparency (ATT) utility for NEXO iOS.
 * Requests user permission for tracking before analytics initialization.
 * Safe for SSR and non-iOS platforms — returns 'authorized' on web/Android.
 * @module lib/capacitor/att
 */

'use client';

import { Capacitor } from '@capacitor/core';

export type ATTStatus = 'authorized' | 'denied' | 'notDetermined' | 'restricted';

/**
 * Request App Tracking Transparency permission on iOS.
 * On non-iOS platforms, returns 'authorized' immediately.
 */
export async function requestATTPermission(): Promise<ATTStatus> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return 'authorized';
  }

  try {
    const { AppTrackingTransparency } = await import('capacitor-plugin-app-tracking-transparency');

    const { status } = await AppTrackingTransparency.requestPermission();
    console.log('[ATT] Permission status:', status);
    return status;
  } catch (error) {
    console.warn('[ATT] Failed to request permission:', error);
    return 'authorized';
  }
}

/**
 * Check current ATT status without prompting.
 */
export async function getATTStatus(): Promise<ATTStatus> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return 'authorized';
  }

  try {
    const { AppTrackingTransparency } = await import('capacitor-plugin-app-tracking-transparency');

    const { status } = await AppTrackingTransparency.getStatus();
    return status;
  } catch {
    return 'authorized';
  }
}

/**
 * Returns true if tracking is authorized (ATT granted or non-iOS).
 */
export function isTrackingAuthorized(status: ATTStatus): boolean {
  return status === 'authorized';
}
