/**
 * Android Back Button handler for NEXO native app.
 * Prevents accidental app exit and handles navigation properly.
 * @module lib/capacitor/android-back
 */

'use client';

import { Capacitor } from '@capacitor/core';

export async function setupAndroidBackButton(
  onBack: () => void
): Promise<() => void> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return () => {};
  }

  try {
    const { App } = await import('@capacitor/app');

    const handle = await App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        onBack();
      }
    });

    return () => handle.remove();
  } catch (error) {
    console.warn('[AndroidBack] Failed to setup:', error);
    return () => {};
  }
}
