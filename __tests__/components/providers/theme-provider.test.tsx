import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/theme-provider";

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="next-themes-provider">{children}</div>
  ),
}));

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      <ThemeProvider>
        <span>child content</span>
      </ThemeProvider>
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("passes props to NextThemesProvider", () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <span>themed</span>
      </ThemeProvider>
    );
    expect(screen.getByTestId("next-themes-provider")).toBeInTheDocument();
    expect(screen.getByText("themed")).toBeInTheDocument();
  });
});
