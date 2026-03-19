'use client';

import { useEffect } from 'react';

export default function PWAInstallSuppressor() {
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  return null;
}
