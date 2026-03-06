/**
 * App initialization hook for NEXO native app.
 * Configures native plugins on app start.
 * @module lib/hooks/use-app-init
 */

'use client';

import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { initStatusBar } from '@/lib/capacitor/status-bar';

export function useAppInit(): void {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !Capacitor.isNativePlatform()) return;
    initialized.current = true;

    const init = async () => {
      await initStatusBar();
    };

    init();
  }, []);
}
