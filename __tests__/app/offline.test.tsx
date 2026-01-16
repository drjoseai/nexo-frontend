/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import OfflinePage from "@/app/offline/page";

describe("OfflinePage", () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(window, "navigator", {
      value: { onLine: false },
      writable: true,
      configurable: true,
    });
  });

  it("renders offline message when not connected", () => {
    render(<OfflinePage />);
    expect(screen.getByText("You're Offline")).toBeInTheDocument();
  });

  it("shows no connection status indicator", () => {
    render(<OfflinePage />);
    expect(screen.getByText("No connection")).toBeInTheDocument();
  });

  it("renders Try Again button when offline", () => {
    render(<OfflinePage />);
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows auto-reconnect message", () => {
    render(<OfflinePage />);
    expect(
      screen.getByText(/NEXO will automatically reconnect/i)
    ).toBeInTheDocument();
  });

  it("shows Back Online message when connected", () => {
    Object.defineProperty(window, "navigator", {
      value: { onLine: true },
      writable: true,
      configurable: true,
    });

    render(<OfflinePage />);
    expect(screen.getByText("Back Online!")).toBeInTheDocument();
  });

  it("shows Connected status when online", () => {
    Object.defineProperty(window, "navigator", {
      value: { onLine: true },
      writable: true,
      configurable: true,
    });

    render(<OfflinePage />);
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("does not show Try Again button when online", () => {
    Object.defineProperty(window, "navigator", {
      value: { onLine: true },
      writable: true,
      configurable: true,
    });

    render(<OfflinePage />);
    expect(screen.queryByRole("button", { name: /try again/i })).not.toBeInTheDocument();
  });
});
