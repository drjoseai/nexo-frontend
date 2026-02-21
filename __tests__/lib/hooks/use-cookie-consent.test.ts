import { renderHook, act } from "@testing-library/react";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";

const STORAGE_KEY = "nexo_cookie_consent";

const validConsent = {
  essential: true,
  analytics: true,
  timestamp: "2026-01-01T00:00:00.000Z",
  version: "1.0",
};

describe("useCookieConsent", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no consent is stored", () => {
    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.consent).toBeNull();
    expect(result.current.hasConsent).toBe(false);
    expect(result.current.analyticsConsent).toBe(false);
    expect(result.current.loaded).toBe(true);
  });

  it("reads consent from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validConsent));

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.consent).toEqual(validConsent);
    expect(result.current.hasConsent).toBe(true);
    expect(result.current.analyticsConsent).toBe(true);
  });

  it("reads consent with analytics=false", () => {
    const noAnalytics = { ...validConsent, analytics: false };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(noAnalytics));

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.hasConsent).toBe(true);
    expect(result.current.analyticsConsent).toBe(false);
  });

  it("updateConsent saves to localStorage", () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.updateConsent(true);
    });

    expect(result.current.hasConsent).toBe(true);
    expect(result.current.analyticsConsent).toBe(true);
    expect(result.current.consent?.essential).toBe(true);
    expect(result.current.consent?.version).toBe("1.0");

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.analytics).toBe(true);
    expect(stored.essential).toBe(true);
    expect(stored.timestamp).toBeDefined();
  });

  it("updateConsent with analytics=false", () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.updateConsent(false);
    });

    expect(result.current.analyticsConsent).toBe(false);
    expect(result.current.consent?.essential).toBe(true);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.analytics).toBe(false);
  });

  it("resetConsent clears localStorage and state", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validConsent));

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.hasConsent).toBe(true);

    act(() => {
      result.current.resetConsent();
    });

    expect(result.current.consent).toBeNull();
    expect(result.current.hasConsent).toBe(false);
    expect(result.current.analyticsConsent).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("handles invalid JSON gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");

    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.consent).toBeNull();
    expect(result.current.hasConsent).toBe(false);
    expect(result.current.loaded).toBe(true);
  });
});
