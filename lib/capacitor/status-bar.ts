/**
 * Status Bar utility for NEXO native app.
 * Sets status bar style to match NEXO dark theme.
 * @module lib/capacitor/status-bar
 */

'use client';

import { Capacitor } from '@capacitor/core';

export async function initStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');

    await StatusBar.setStyle({ style: Style.Dark });

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#110e0c' });
    }

    await StatusBar.show();
    console.log('[StatusBar] Initialized with NEXO dark theme');
  } catch (error) {
    console.warn('[StatusBar] Failed to initialize:', error);
  }
}
