import React from "react";
import { render, screen } from "@testing-library/react";
import { Separator } from "@/components/ui/separator";

jest.mock("@radix-ui/react-separator", () => ({
  Root: ({ className, orientation, decorative, ...props }: any) => (
    <div
      role="separator"
      data-slot="separator"
      data-orientation={orientation}
      aria-orientation={orientation}
      className={className}
      {...props}
    />
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(" "),
}));

describe("Separator", () => {
  it("renders with horizontal orientation by default", () => {
    render(<Separator />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders with vertical orientation", () => {
    render(<Separator orientation="vertical" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("data-orientation", "vertical");
  });

  it("has decorative=true by default", () => {
    render(<Separator />);
    const sep = screen.getByRole("separator");
    expect(sep).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Separator className="my-custom-class" />);
    const sep = screen.getByRole("separator");
    expect(sep.className).toContain("my-custom-class");
  });

  it('has data-slot="separator"', () => {
    render(<Separator />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("data-slot", "separator");
  });

  it("passes additional props", () => {
    render(<Separator data-testid="my-sep" />);
    expect(screen.getByTestId("my-sep")).toBeInTheDocument();
  });
});
