/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      "pwa.install": {
        title: "Install NEXO",
        description: "Add NEXO to your home screen for the best experience",
        button: "Install",
        iosStep1: "Tap the share button",
        iosStep2: 'Then "Add to Home Screen"',
      },
    };
    return (key: string) => translations[namespace]?.[key] || key;
  },
}));

// Default mock values for usePWA
const defaultPWAMock = {
  isInstalled: false,
  isOnline: true,
  isIOS: false,
  isAndroid: false,
  canInstall: true,
  deferredPrompt: null,
  isDismissed: false,
  triggerPrompt: false,
  promptInstall: jest.fn().mockResolvedValue(false),
  dismissInstall: jest.fn(),
};

let mockPWAValues = { ...defaultPWAMock };

jest.mock("@/lib/hooks/use-pwa", () => ({
  usePWA: () => mockPWAValues,
}));

describe("PWAInstallPrompt", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockPWAValues = {
      ...defaultPWAMock,
      promptInstall: jest.fn().mockResolvedValue(false),
      dismissInstall: jest.fn(),
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not render initially (waits 20s)", () => {
    render(<PWAInstallPrompt />);
    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("shows prompt after 20 seconds when canInstall is true", () => {
    render(<PWAInstallPrompt />);

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(screen.getByText("Install NEXO")).toBeInTheDocument();
  });

  it("does not render when isInstalled is true", () => {
    mockPWAValues = { ...defaultPWAMock, isInstalled: true };

    render(<PWAInstallPrompt />);

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("does not render when isDismissed and no triggerPrompt", () => {
    mockPWAValues = { ...defaultPWAMock, isDismissed: true };

    render(<PWAInstallPrompt />);

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("shows prompt immediately when triggerPrompt is true", () => {
    mockPWAValues = { ...defaultPWAMock, triggerPrompt: true };

    render(<PWAInstallPrompt />);

    expect(screen.getByText("Install NEXO")).toBeInTheDocument();
  });

  it("shows prompt immediately when triggerPrompt overrides isDismissed", () => {
    mockPWAValues = {
      ...defaultPWAMock,
      isDismissed: true,
      triggerPrompt: true,
    };

    render(<PWAInstallPrompt />);

    expect(screen.getByText("Install NEXO")).toBeInTheDocument();
  });

  it("calls promptInstall when install button is clicked", async () => {
    const mockPromptInstall = jest.fn().mockResolvedValue(false);
    mockPWAValues = {
      ...defaultPWAMock,
      triggerPrompt: true,
      promptInstall: mockPromptInstall,
    };

    render(<PWAInstallPrompt />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /install/i }));
    });

    expect(mockPromptInstall).toHaveBeenCalled();
  });

  it("hides prompt when install is accepted", async () => {
    const mockPromptInstall = jest.fn().mockResolvedValue(true);
    mockPWAValues = {
      ...defaultPWAMock,
      triggerPrompt: true,
      promptInstall: mockPromptInstall,
    };

    render(<PWAInstallPrompt />);

    expect(screen.getByText("Install NEXO")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /install/i }));
    });

    expect(screen.queryByText("Install NEXO")).not.toBeInTheDocument();
  });

  it("calls dismissInstall when dismiss button is clicked", async () => {
    const mockDismissInstall = jest.fn();
    mockPWAValues = {
      ...defaultPWAMock,
      triggerPrompt: true,
      dismissInstall: mockDismissInstall,
    };

    render(<PWAInstallPrompt />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    });

    expect(mockDismissInstall).toHaveBeenCalled();
  });

  it("shows iOS instructions when isIOS is true", () => {
    mockPWAValues = {
      ...defaultPWAMock,
      isIOS: true,
      canInstall: false,
      triggerPrompt: true,
    };

    render(<PWAInstallPrompt />);

    expect(screen.getByText("Tap the share button")).toBeInTheDocument();
    expect(
      screen.getByText('Then "Add to Home Screen"')
    ).toBeInTheDocument();
  });

  it("shows install button for non-iOS devices", () => {
    mockPWAValues = { ...defaultPWAMock, triggerPrompt: true };

    render(<PWAInstallPrompt />);

    expect(screen.getByRole("button", { name: /install/i })).toBeInTheDocument();
  });
});
