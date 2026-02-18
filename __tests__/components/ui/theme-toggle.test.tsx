/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockSetTheme = jest.fn();
const mockUseTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

jest.mock("lucide-react", () => ({
  Moon: (props: any) => <span data-testid="moon-icon" {...props} />,
  Sun: (props: any) => <span data-testid="sun-icon" {...props} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

import { ThemeToggle } from "@/components/ui/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({ theme: "dark", setTheme: mockSetTheme });
  });

  describe("dark mode (mounted)", () => {
    it("shows an enabled button after mounting", async () => {
      await act(async () => {
        render(<ThemeToggle />);
      });
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    it('shows Sun icon with aria-label "Switch to light mode"', async () => {
      await act(async () => {
        render(<ThemeToggle />);
      });
      expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch to light mode"
      );
    });

    it('calls setTheme("light") on click', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<ThemeToggle />);
      });
      await user.click(screen.getByRole("button"));
      expect(mockSetTheme).toHaveBeenCalledWith("light");
    });
  });

  describe("light mode (mounted)", () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({ theme: "light", setTheme: mockSetTheme });
    });

    it('shows Moon icon with aria-label "Switch to dark mode"', async () => {
      await act(async () => {
        render(<ThemeToggle />);
      });
      expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Switch to dark mode"
      );
    });

    it('calls setTheme("dark") on click', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(<ThemeToggle />);
      });
      await user.click(screen.getByRole("button"));
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
    });
  });
});
