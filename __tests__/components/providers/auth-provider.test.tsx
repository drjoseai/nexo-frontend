import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/providers/auth-provider";

const mockLoadUser = jest.fn();
const mockUseAuthStore = jest.fn();

jest.mock("@/lib/store/auth", () => ({
  useAuthStore: (selector: (state: Record<string, unknown>) => unknown) => {
    return mockUseAuthStore(selector);
  },
}));

function TestConsumer() {
  const { isAuthenticated, isLoading, user } = useAuth();
  return (
    <div>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? "has-user" : "no-user"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    mockLoadUser.mockClear();
    mockLoadUser.mockResolvedValue(undefined);
    mockUseAuthStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) => {
      const state = {
        loadUser: mockLoadUser,
        isAuthenticated: false,
        isLoading: false,
        user: null,
      };
      return selector(state);
    });
  });

  it("renders children", () => {
    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("calls loadUser on mount", async () => {
    render(
      <AuthProvider>
        <div />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(mockLoadUser).toHaveBeenCalledTimes(1);
    });
  });

  it("handles loadUser error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockLoadUser.mockRejectedValue(new Error("auth failed"));

    render(
      <AuthProvider>
        <span>still renders</span>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "[AuthProvider] Initialization error:",
        expect.any(Error)
      );
    });
    expect(screen.getByText("still renders")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

describe("useAuth", () => {
  beforeEach(() => {
    mockUseAuthStore.mockImplementation((selector: (s: Record<string, unknown>) => unknown) => {
      const state = {
        loadUser: mockLoadUser,
        isAuthenticated: true,
        isLoading: false,
        user: { id: "1", email: "test@test.com" },
      };
      return selector(state);
    });
  });

  it("returns auth state from store", () => {
    render(<TestConsumer />);
    expect(screen.getByTestId("auth")).toHaveTextContent("true");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("has-user");
  });
});
