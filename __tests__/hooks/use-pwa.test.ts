/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { usePWA } from "@/lib/hooks/use-pwa";

describe("usePWA hook", () => {
  const originalMatchMedia = window.matchMedia;
  const originalNavigator = window.navigator;

  beforeEach(() => {
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        onLine: true,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      writable: true,
      configurable: true,
    });

    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("returns initial PWA status", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current).toEqual(
      expect.objectContaining({
        isInstalled: false,
        isOnline: true,
        isIOS: false,
        isAndroid: false,
      })
    );
  });

  it("detects iOS device", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        onLine: true,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => usePWA());
    expect(result.current.isIOS).toBe(true);
  });

  it("detects Android device", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        ...originalNavigator,
        onLine: true,
        userAgent: "Mozilla/5.0 (Linux; Android 11; Pixel 5)",
      },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => usePWA());
    expect(result.current.isAndroid).toBe(true);
  });

  it("detects standalone mode", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => usePWA());
    expect(result.current.isInstalled).toBe(true);
  });

  it("handles online/offline events", () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.isOnline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current.isOnline).toBe(true);
  });
});

