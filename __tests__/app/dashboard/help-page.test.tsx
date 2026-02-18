import React from "react";
import { render, screen } from "@testing-library/react";
import HelpPage from "@/app/dashboard/help/page";

jest.mock("@/components/help/HelpContent", () => {
  return function MockHelpContent() {
    return <div data-testid="help-content">Help Content</div>;
  };
});

describe("HelpPage", () => {
  it("renders HelpContent component", () => {
    render(<HelpPage />);
    expect(screen.getByTestId("help-content")).toBeInTheDocument();
  });
});
