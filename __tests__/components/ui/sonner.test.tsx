import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark" }),
}));

jest.mock("lucide-react", () => ({
  CircleCheckIcon: (props: any) => <span data-testid="check-icon" {...props} />,
  InfoIcon: (props: any) => <span data-testid="info-icon" {...props} />,
  TriangleAlertIcon: (props: any) => (
    <span data-testid="warning-icon" {...props} />
  ),
  OctagonXIcon: (props: any) => <span data-testid="error-icon" {...props} />,
  Loader2Icon: (props: any) => (
    <span data-testid="loading-icon" {...props} />
  ),
}));

let capturedProps: any = {};

jest.mock("sonner", () => ({
  Toaster: (props: any) => {
    capturedProps = props;
    return <div data-testid="sonner-toaster" />;
  },
}));

import { Toaster } from "@/components/ui/sonner";

describe("Toaster (sonner wrapper)", () => {
  beforeEach(() => {
    capturedProps = {};
  });

  it("renders the Toaster component", () => {
    render(<Toaster />);
    expect(screen.getByTestId("sonner-toaster")).toBeInTheDocument();
  });

  it("passes theme from useTheme", () => {
    render(<Toaster />);
    expect(capturedProps.theme).toBe("dark");
  });

  it('has className "toaster group"', () => {
    render(<Toaster />);
    expect(capturedProps.className).toBe("toaster group");
  });

  it("includes custom icons", () => {
    render(<Toaster />);
    expect(capturedProps.icons).toBeDefined();
    expect(capturedProps.icons.success).toBeDefined();
    expect(capturedProps.icons.info).toBeDefined();
    expect(capturedProps.icons.warning).toBeDefined();
    expect(capturedProps.icons.error).toBeDefined();
    expect(capturedProps.icons.loading).toBeDefined();
  });

  it("passes custom style variables", () => {
    render(<Toaster />);
    expect(capturedProps.style).toBeDefined();
    expect(capturedProps.style["--normal-bg"]).toBe("var(--popover)");
    expect(capturedProps.style["--normal-text"]).toBe(
      "var(--popover-foreground)"
    );
    expect(capturedProps.style["--normal-border"]).toBe("var(--border)");
    expect(capturedProps.style["--border-radius"]).toBe("var(--radius)");
  });

  it("passes additional props", () => {
    render(<Toaster position="top-right" />);
    expect(capturedProps.position).toBe("top-right");
  });
});
