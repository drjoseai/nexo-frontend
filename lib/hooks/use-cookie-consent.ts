"use client";

import { useCallback, useState } from "react";

const STORAGE_KEY = "nexo_cookie_consent";
const CONSENT_VERSION = "1.0";

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
  version: string;
}

function readStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(readStoredConsent);
  const loaded = typeof window !== "undefined";

  const updateConsent = useCallback((analytics: boolean) => {
    const newConsent: CookieConsent = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));
    setConsent(newConsent);
  }, []);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConsent(null);
  }, []);

  return {
    consent,
    loaded,
    hasConsent: consent !== null,
    analyticsConsent: consent?.analytics ?? false,
    updateConsent,
    resetConsent,
  };
}
