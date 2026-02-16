"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  canInstall: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  isDismissed: boolean;
  triggerPrompt: boolean;
  promptInstall: () => Promise<boolean>;
  dismissInstall: () => void;
}

const DISMISS_KEY = "pwa-prompt-dismissed";
const DISMISS_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

function checkIsDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (!dismissedAt) return false;
  const elapsed = Date.now() - parseInt(dismissedAt, 10);
  return elapsed < DISMISS_COOLDOWN_MS;
}

// Lazy initializer to avoid setState in effect
const getInitialStatus = () => {
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
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isOnline = navigator.onLine;

  return {
    isInstalled,
    isOnline,
    isIOS,
    isAndroid,
    canInstall:
      !isInstalled &&
      (isIOS || isAndroid || "BeforeInstallPromptEvent" in window),
  };
};

export function usePWA(): PWAStatus {
  const [status, setStatus] = useState(getInitialStatus);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(checkIsDismissed);
  const [triggerPrompt] = useState(() => {
    if (typeof window === "undefined") return false;
    const params = new URLSearchParams(window.location.search);
    const hasInstallParam = params.get("install") === "true";
    if (hasInstallParam) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    return hasInstallParam;
  });

  // Listen for online/offline and display-mode changes
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

  // Capture beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setStatus((s) => ({ ...s, canInstall: true }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
  }, []);

  return {
    ...status,
    deferredPrompt,
    isDismissed,
    triggerPrompt,
    promptInstall,
    dismissInstall,
  };
}
