"use client";

import { useEffect, useState } from "react";

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  canInstall: boolean;
}

// Lazy initializer to avoid setState in effect
const getInitialStatus = (): PWAStatus => {
  if (typeof window === "undefined") {
    return {
      isInstalled: false,
      isOnline: true,
      isIOS: false,
      isAndroid: false,
      canInstall: false,
    };
  }

  const isInstalled =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isOnline = navigator.onLine;

  return {
    isInstalled,
    isOnline,
    isIOS,
    isAndroid,
    canInstall: !isInstalled && (isIOS || isAndroid || "BeforeInstallPromptEvent" in window),
  };
};

export function usePWA(): PWAStatus {
  const [status, setStatus] = useState<PWAStatus>(getInitialStatus);

  useEffect(() => {
    const handleOnline = () => setStatus((s) => ({ ...s, isOnline: true }));
    const handleOffline = () => setStatus((s) => ({ ...s, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setStatus((s) => ({ ...s, isInstalled: e.matches }));
    };
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  return status;
}
