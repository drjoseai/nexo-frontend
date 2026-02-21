import { render, screen, fireEvent } from "@testing-library/react";
import { MobileHeader } from "@/components/layout/MobileHeader";

jest.mock("lucide-react", () => ({
  Menu: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-menu" {...props} />
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-sparkles" {...props} />
  ),
}));

jest.mock("next/link", () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  );
});

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

describe("MobileHeader", () => {
  it("renders logo link to /dashboard", () => {
    render(<MobileHeader onMenuClick={jest.fn()} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("NEXO")).toBeInTheDocument();
  });

  it("renders hamburger button with correct aria-label", () => {
    render(<MobileHeader onMenuClick={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
  });

  it("calls onMenuClick when hamburger button is clicked", () => {
    const handleClick = jest.fn();
    render(<MobileHeader onMenuClick={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders sparkles and menu icons", () => {
    render(<MobileHeader onMenuClick={jest.fn()} />);
    expect(screen.getByTestId("icon-sparkles")).toBeInTheDocument();
    expect(screen.getByTestId("icon-menu")).toBeInTheDocument();
  });
});
