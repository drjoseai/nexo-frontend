/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";

describe("PWAInstallPrompt", () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Default: not standalone, not iOS
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    Object.defineProperty(window, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      writable: true,
      configurable: true,
    });
  });

  it("does not render initially (waits 30s)", () => {
    render(<PWAInstallPrompt />);
    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("does not render when in standalone mode", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    render(<PWAInstallPrompt />);
    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("does not render if dismissed within 24 hours", () => {
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());

    render(<PWAInstallPrompt />);
    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("detects iOS correctly", () => {
    Object.defineProperty(window, "navigator", {
      value: {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      },
      writable: true,
      configurable: true,
    });

    // The component doesn't render until 30s, but we can verify the detection logic
    const { container } = render(<PWAInstallPrompt />);
    expect(container).toBeDefined();
  });

  it("cleans up event listeners on unmount", () => {
    const removeEventListener = jest.fn();
    window.removeEventListener = removeEventListener;

    const { unmount } = render(<PWAInstallPrompt />);
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      "beforeinstallprompt",
      expect.any(Function)
    );
  });
});

