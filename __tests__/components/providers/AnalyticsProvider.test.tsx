import { render, screen } from "@testing-library/react";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";

const mockInit = jest.fn();
const mockTrack = jest.fn();

jest.mock("@/lib/services/analytics", () => ({
  analytics: {
    init: (...args: unknown[]) => mockInit(...args),
    track: (...args: unknown[]) => mockTrack(...args),
  },
  AnalyticsEvents: {
    PAGE_VIEWED: "page_viewed",
  },
}));

const mockUseCookieConsent = jest.fn();

jest.mock("@/lib/hooks/use-cookie-consent", () => ({
  useCookieConsent: () => mockUseCookieConsent(),
}));

describe("AnalyticsProvider", () => {
  beforeEach(() => {
    mockInit.mockClear();
    mockTrack.mockClear();
    mockUseCookieConsent.mockReturnValue({
      consent: { essential: true, analytics: true, timestamp: "", version: "1.0" },
      loaded: true,
      hasConsent: true,
      analyticsConsent: true,
      updateConsent: jest.fn(),
      resetConsent: jest.fn(),
    });
  });

  it("renders children", () => {
    render(
      <AnalyticsProvider>
        <span>app content</span>
      </AnalyticsProvider>
    );
    expect(screen.getByText("app content")).toBeInTheDocument();
  });

  it("calls analytics.init when consent is granted", () => {
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>
    );
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it("tracks page view when consent is granted", () => {
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>
    );
    expect(mockTrack).toHaveBeenCalledWith("page_viewed", { page: "/" });
  });

  it("does not init analytics when consent is denied", () => {
    mockUseCookieConsent.mockReturnValue({
      consent: { essential: true, analytics: false, timestamp: "", version: "1.0" },
      loaded: true,
      hasConsent: true,
      analyticsConsent: false,
      updateConsent: jest.fn(),
      resetConsent: jest.fn(),
    });

    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>
    );
    expect(mockInit).not.toHaveBeenCalled();
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it("does not init analytics when not yet loaded", () => {
    mockUseCookieConsent.mockReturnValue({
      consent: null,
      loaded: false,
      hasConsent: false,
      analyticsConsent: false,
      updateConsent: jest.fn(),
      resetConsent: jest.fn(),
    });

    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>
    );
    expect(mockInit).not.toHaveBeenCalled();
  });
});
