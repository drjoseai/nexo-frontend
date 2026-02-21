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

describe("AnalyticsProvider", () => {
  beforeEach(() => {
    mockInit.mockClear();
    mockTrack.mockClear();
  });

  it("renders children", () => {
    render(
      <AnalyticsProvider>
        <span>app content</span>
      </AnalyticsProvider>
    );
    expect(screen.getByText("app content")).toBeInTheDocument();
  });

  it("calls analytics.init on mount", () => {
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>
    );
    expect(mockInit).toHaveBeenCalledTimes(1);
  });

  it("tracks page view with current pathname", () => {
    render(
      <AnalyticsProvider>
        <div />
      </AnalyticsProvider>
    );
    expect(mockTrack).toHaveBeenCalledWith("page_viewed", { page: "/" });
  });
});
