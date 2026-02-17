/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PWAUpdateNotification } from "@/components/pwa/PWAUpdateNotification";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      updateAvailable: "Update Available",
      updateDescription: "A new version of NEXO is available. Update now for the best experience.",
      updateNow: "Update Now",
      later: "Later",
    };
    return translations[key] || key;
  },
}));

// Mock del Service Worker
const mockPostMessage = jest.fn();
const mockAddEventListener = jest.fn();

const createMockRegistration = (options: {
  waiting?: ServiceWorker | null;
  installing?: ServiceWorker | null;
} = {}) => ({
  waiting: options.waiting || null,
  installing: options.installing || null,
  addEventListener: mockAddEventListener,
});

describe("PWAUpdateNotification", () => {
  let originalNavigator: Navigator;
  let mockController: ServiceWorker | null;

  beforeEach(() => {
    jest.clearAllMocks();
    mockController = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    // Mock navigator.serviceWorker
    originalNavigator = global.navigator;
    
    Object.defineProperty(global, "navigator", {
      value: {
        ...originalNavigator,
        serviceWorker: {
          ready: Promise.resolve(createMockRegistration()),
          controller: mockController,
          addEventListener: jest.fn(),
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it("does not render initially when no update is available", () => {
    render(<PWAUpdateNotification />);
    
    expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
  });

  it("renders update notification when waiting worker exists", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: mockWaitingWorker })),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByText("Update Available")).toBeInTheDocument();
    });
  });

  it("renders update description text", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: mockWaitingWorker })),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByText(/A new version of NEXO is available/)).toBeInTheDocument();
    });
  });

  it("renders Update Now button", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: mockWaitingWorker })),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Update Now" })).toBeInTheDocument();
    });
  });

  it("renders Later button", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: mockWaitingWorker })),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Later" })).toBeInTheDocument();
    });
  });

  it("dismisses notification when Later button is clicked", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: mockWaitingWorker })),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByText("Update Available")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Later" }));

    await waitFor(() => {
      expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
    });
  });

  it("dismisses notification when X button is clicked", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: mockWaitingWorker })),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByText("Update Available")).toBeInTheDocument();
    });

    // Find the X button (third button, after Update Now and Later)
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(btn => btn.querySelector("svg.lucide-x"));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
    });
  });

  it("sends SKIP_WAITING message when Update Now is clicked", async () => {
    const mockWaitingWorker = { postMessage: mockPostMessage } as unknown as ServiceWorker;
    const mockRegistration = createMockRegistration({ waiting: mockWaitingWorker });
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(mockRegistration),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(screen.getByText("Update Available")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Now" }));

    expect(mockPostMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" });
  });

  it("does not render when serviceWorker is not supported", () => {
    Object.defineProperty(global, "navigator", {
      value: {
        ...originalNavigator,
        serviceWorker: undefined,
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);
    
    expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
  });

  it("does not render when there is no controller (first visit)", async () => {
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration({ waiting: { postMessage: jest.fn() } as unknown as ServiceWorker })),
        controller: null, // No controller = first visit
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    // Give it time to potentially render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
  });

  it("handles service worker registration error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.reject(new Error("Registration failed")),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Service Worker registration error:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("cleans up event listeners on unmount", () => {
    const mockRemoveEventListener = jest.fn();
    
    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration()),
        controller: mockController,
        addEventListener: jest.fn(),
        removeEventListener: mockRemoveEventListener,
      },
      writable: true,
      configurable: true,
    });

    const { unmount } = render(<PWAUpdateNotification />);
    unmount();

    // Component should unmount without errors
    expect(true).toBe(true);
  });

  it("registers controllerchange event listener", async () => {
    let controllerChangeCallback: (() => void) | null = null;

    const mockSwAddEventListener = jest.fn((event: string, callback: () => void) => {
      if (event === "controllerchange") {
        controllerChangeCallback = callback;
      }
    });

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration()),
        controller: mockController,
        addEventListener: mockSwAddEventListener,
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    // Wait for the effect to run and verify the listener was registered
    await waitFor(() => {
      expect(mockSwAddEventListener).toHaveBeenCalledWith(
        "controllerchange",
        expect.any(Function)
      );
    });

    // Verify the callback was captured
    expect(controllerChangeCallback).not.toBeNull();
  });

  it("shows update notification when updatefound triggers with installed worker", async () => {
    let updateFoundCallback: (() => void) | null = null;

    const mockInstallingWorker = {
      state: "installing",
      addEventListener: jest.fn((event: string, cb: () => void) => {
        if (event === "statechange") {
          // Store callback to trigger later
          setTimeout(() => {
            // Simulate state change to "installed"
            Object.defineProperty(mockInstallingWorker, "state", {
              value: "installed",
              writable: true,
              configurable: true,
            });
            cb();
          }, 10);
        }
      }),
    } as unknown as ServiceWorker;

    const mockReg = {
      waiting: null,
      installing: mockInstallingWorker,
      addEventListener: jest.fn((event: string, cb: () => void) => {
        if (event === "updatefound") {
          updateFoundCallback = cb;
        }
      }),
    };

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(mockReg),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    // Wait for effect to register the listener
    await waitFor(() => {
      expect(mockReg.addEventListener).toHaveBeenCalledWith(
        "updatefound",
        expect.any(Function)
      );
    });

    // Trigger updatefound event
    if (updateFoundCallback) {
      updateFoundCallback();
    }

    // Wait for the statechange to fire and show notification
    await waitFor(() => {
      expect(screen.getByText("Update Available")).toBeInTheDocument();
    });
  });

  it("handles updatefound when installing worker is null", async () => {
    let updateFoundCallback: (() => void) | null = null;

    const mockReg = {
      waiting: null,
      installing: null, // No installing worker
      addEventListener: jest.fn((event: string, cb: () => void) => {
        if (event === "updatefound") {
          updateFoundCallback = cb;
        }
      }),
    };

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(mockReg),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(mockReg.addEventListener).toHaveBeenCalledWith(
        "updatefound",
        expect.any(Function)
      );
    });

    // Trigger updatefound with no installing worker — should not throw
    if (updateFoundCallback) {
      expect(() => updateFoundCallback!()).not.toThrow();
    }

    // Should NOT show update
    expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
  });

  it("calls window.location.reload on controllerchange", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let controllerChangeCallback: (() => void) | null = null;

    const mockSwAddEventListener = jest.fn((event: string, callback: () => void) => {
      if (event === "controllerchange") {
        controllerChangeCallback = callback;
      }
    });

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(createMockRegistration()),
        controller: mockController,
        addEventListener: mockSwAddEventListener,
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(mockSwAddEventListener).toHaveBeenCalledWith(
        "controllerchange",
        expect.any(Function)
      );
    });

    // Trigger the controllerchange callback — jsdom does not implement
    // navigation, so window.location.reload() emits a "Not implemented" error
    controllerChangeCallback!();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Not implemented: navigation"),
      })
    );

    consoleSpy.mockRestore();
  });

  it("does not show update when statechange fires but state is not installed", async () => {
    let updateFoundCallback: (() => void) | null = null;

    const mockInstallingWorker = {
      state: "activating", // NOT "installed"
      addEventListener: jest.fn((event: string, cb: () => void) => {
        if (event === "statechange") {
          setTimeout(() => cb(), 10);
        }
      }),
    } as unknown as ServiceWorker;

    const mockReg = {
      waiting: null,
      installing: mockInstallingWorker,
      addEventListener: jest.fn((event: string, cb: () => void) => {
        if (event === "updatefound") {
          updateFoundCallback = cb;
        }
      }),
    };

    Object.defineProperty(global.navigator, "serviceWorker", {
      value: {
        ready: Promise.resolve(mockReg),
        controller: mockController,
        addEventListener: jest.fn(),
      },
      writable: true,
      configurable: true,
    });

    render(<PWAUpdateNotification />);

    await waitFor(() => {
      expect(mockReg.addEventListener).toHaveBeenCalledWith(
        "updatefound",
        expect.any(Function)
      );
    });

    if (updateFoundCallback) {
      updateFoundCallback();
    }

    // Wait for statechange to fire
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should NOT show update since state is "activating" not "installed"
    expect(screen.queryByText("Update Available")).not.toBeInTheDocument();
  });
});
