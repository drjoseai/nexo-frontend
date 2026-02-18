import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/ui/footer";

jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe("Footer", () => {
  it("renders the NEXO logo", () => {
    render(<Footer />);
    expect(screen.getByText("NEXO")).toBeInTheDocument();
  });

  it('renders "Terms of Service" link with href="/terms"', () => {
    render(<Footer />);
    const link = screen.getByText("Terms of Service");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/terms");
  });

  it('renders "Privacy Policy" link with href="/privacy"', () => {
    render(<Footer />);
    const link = screen.getByText("Privacy Policy");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/privacy");
  });

  it("shows copyright with the current year and company name", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} VENKO AI INNOVATIONS LLC`)
    ).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const { container } = render(<Footer className="custom-class" />);
    const footer = container.querySelector("footer");
    expect(footer?.className).toContain("custom-class");
  });

  it("has empty className by default", () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector("footer");
    expect(footer?.className).not.toContain("undefined");
  });
});
