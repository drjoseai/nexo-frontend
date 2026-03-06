/**
 * Hook to handle Android back button in NEXO.
 * @module lib/hooks/use-android-back
 */

'use client';

import { useEffect } from 'react';
import { setupAndroidBackButton } from '@/lib/capacitor/android-back';

export function useAndroidBack(onBack?: () => void): void {
  useEffect(() => {
    let cleanup: () => void = () => {};

    setupAndroidBackButton(onBack || (() => {
      console.log('[AndroidBack] At root, ignoring back press');
    })).then(fn => { cleanup = fn; });

    return () => cleanup();
  }, [onBack]);
}
