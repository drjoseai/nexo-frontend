/**
 * Offline Screen for NEXO native app.
 * Shows when device has no internet connection.
 * @module components/native/OfflineScreen
 */

'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    let removeListener: (() => void) | null = null;
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/network').then(({ Network }) => {
        Network.getStatus().then(status => setIsOnline(status.connected));
        Network.addListener('networkStatusChange', status => {
          setIsOnline(status.connected);
        }).then(handle => {
          removeListener = () => handle.remove();
        });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeListener?.();
    };
  }, []);

  return isOnline;
}

export function OfflineScreen({ children }: { children: React.ReactNode }) {
  const isOnline = useNetworkStatus();

  if (isOnline) return <>{children}</>;

  return (
    <>
      {children}
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-10 w-10 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M8.111 8.111A5.5 5.5 0 0115.89 15.89M6.343 6.343A8 8 0 0117.657 17.657M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Sin conexión</h2>
            <p className="text-sm text-muted-foreground">
              Verifica tu conexión a internet para continuar usando NEXO.
            </p>
          </div>

          <div className="text-2xl font-bold text-gradient font-serif">NEXO</div>
        </div>
      </div>
    </>
  );
}
