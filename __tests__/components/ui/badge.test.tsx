import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "@/components/ui/badge";

jest.mock("@radix-ui/react-slot", () => ({
  Slot: ({ children, ...props }: any) => (
    <span data-testid="slot" {...props}>
      {children}
    </span>
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it('renders with variant "secondary"', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it('renders with variant "destructive"', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText("Destructive")).toBeInTheDocument();
  });

  it('renders with variant "outline"', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText("Outline")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Badge className="extra-class">Styled</Badge>);
    const badge = screen.getByText("Styled");
    expect(badge.className).toContain("extra-class");
  });

  it('has data-slot="badge"', () => {
    render(<Badge>Slot</Badge>);
    expect(screen.getByText("Slot")).toHaveAttribute("data-slot", "badge");
  });

  it("passes children correctly", () => {
    render(
      <Badge>
        <span data-testid="child">Inner</span>
      </Badge>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders as span by default", () => {
    render(<Badge>SpanBadge</Badge>);
    const badge = screen.getByText("SpanBadge");
    expect(badge.tagName).toBe("SPAN");
  });

  it("renders via Slot when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    );
    expect(screen.getByTestId("slot")).toBeInTheDocument();
  });

  it("exports badgeVariants", () => {
    expect(badgeVariants).toBeDefined();
    expect(typeof badgeVariants).toBe("function");
  });
});
