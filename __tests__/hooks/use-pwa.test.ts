/**
 * @jest-environment jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { usePWA } from "@/lib/hooks/use-pwa";

describe("usePWA hook", () => {
  const originalMatchMedia = window.matchMedia;
  const originalNavigator = window.navigator;

  beforeEach(() => {
    localStorage.clear();

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

    jest.spyOn(window.history, "replaceState").mockImplementation(() => {});
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  it("returns initial PWA status", () => {
    const { result } = renderHook(() => usePWA());

    expect(result.current).toEqual(
      expect.objectContaining({
        isInstalled: false,
        isOnline: true,
        isIOS: false,
        isAndroid: false,
        deferredPrompt: null,
        isDismissed: false,
        triggerPrompt: false,
      })
    );
    expect(typeof result.current.promptInstall).toBe("function");
    expect(typeof result.current.dismissInstall).toBe("function");
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

  it("captures beforeinstallprompt event", () => {
    const { result } = renderHook(() => usePWA());

    const mockEvent = new Event("beforeinstallprompt");
    Object.assign(mockEvent, {
      prompt: jest.fn(),
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(result.current.deferredPrompt).not.toBeNull();
    expect(result.current.canInstall).toBe(true);
  });

  it("promptInstall returns false when no deferred prompt", async () => {
    const { result } = renderHook(() => usePWA());

    let accepted: boolean = true;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(accepted).toBe(false);
  });

  it("promptInstall calls prompt and returns true on accepted", async () => {
    const { result } = renderHook(() => usePWA());

    const mockPrompt = jest.fn().mockResolvedValue(undefined);
    const mockEvent = new Event("beforeinstallprompt");
    Object.assign(mockEvent, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    let accepted: boolean = false;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(accepted).toBe(true);
    expect(result.current.deferredPrompt).toBeNull();
  });

  it("promptInstall returns false on dismissed", async () => {
    const { result } = renderHook(() => usePWA());

    const mockPrompt = jest.fn().mockResolvedValue(undefined);
    const mockEvent = new Event("beforeinstallprompt");
    Object.assign(mockEvent, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    });

    act(() => {
      window.dispatchEvent(mockEvent);
    });

    let accepted: boolean = true;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(accepted).toBe(false);
  });

  it("dismissInstall sets localStorage and isDismissed", () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.isDismissed).toBe(false);

    act(() => {
      result.current.dismissInstall();
    });

    expect(result.current.isDismissed).toBe(true);
    expect(localStorage.getItem("pwa-prompt-dismissed")).toBeTruthy();
  });

  it("isDismissed is true when dismissed within 4 hours", () => {
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());

    const { result } = renderHook(() => usePWA());
    expect(result.current.isDismissed).toBe(true);
  });

  it("isDismissed is false when dismissed more than 4 hours ago", () => {
    const fiveHoursAgo = Date.now() - 5 * 60 * 60 * 1000;
    localStorage.setItem("pwa-prompt-dismissed", fiveHoursAgo.toString());

    const { result } = renderHook(() => usePWA());
    expect(result.current.isDismissed).toBe(false);
  });

  it("detects ?install=true deep link", () => {
    // Mock URLSearchParams to simulate ?install=true
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: (key: string) => (key === "install" ? "true" : null),
    })) as unknown as typeof URLSearchParams;

    const { result } = renderHook(() => usePWA());

    expect(result.current.triggerPrompt).toBe(true);
    expect(window.history.replaceState).toHaveBeenCalled();

    global.URLSearchParams = originalURLSearchParams;
  });

  it("does not trigger prompt for other query params", () => {
    const originalURLSearchParams = global.URLSearchParams;
    global.URLSearchParams = jest.fn().mockImplementation(() => ({
      get: () => null,
    })) as unknown as typeof URLSearchParams;

    const { result } = renderHook(() => usePWA());
    expect(result.current.triggerPrompt).toBe(false);

    global.URLSearchParams = originalURLSearchParams;
  });
});
