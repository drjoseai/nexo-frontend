import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage from "@/app/dashboard/profile/page";

jest.mock("@/components/profile", () => ({
  ProfilePageLazy: () => <div data-testid="profile-content">Profile</div>,
}));

describe("ProfilePage", () => {
  it("renders ProfilePageLazy component", () => {
    render(<ProfilePage />);
    expect(screen.getByTestId("profile-content")).toBeInTheDocument();
  });
});
