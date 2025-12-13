import { render, screen } from "@testing-library/react";
import { ChatInterfaceLazy } from "@/components/chat/ChatInterfaceLazy";

// Mock next/dynamic
jest.mock("next/dynamic", () => {
  return function mockDynamic(
    importFn: () => Promise<{ default: React.ComponentType }>,
    options?: { loading?: () => React.ReactNode }
  ) {
    // Return the loading component for testing
    const MockComponent = (props: Record<string, unknown>) => {
      // For testing, we show the loading state
      if (options?.loading) {
        return options.loading();
      }
      return <div data-testid="chat-interface-mock" {...props} />;
    };
    MockComponent.displayName = "DynamicComponent";
    return MockComponent;
  };
});

describe("ChatInterfaceLazy", () => {
  describe("Loading State", () => {
    it("renders loading skeleton", () => {
      render(<ChatInterfaceLazy avatarId="lia" />);
      
      // Should show loading text
      expect(screen.getByText("Cargando chat...")).toBeInTheDocument();
    });

    it("renders header skeleton", () => {
      render(<ChatInterfaceLazy avatarId="lia" />);
      
      // Header skeleton elements should be present
      const container = screen.getByText("Cargando chat...").closest("div");
      expect(container).toBeInTheDocument();
    });

    it("has proper skeleton structure", () => {
      const { container } = render(<ChatInterfaceLazy avatarId="lia" />);
      
      // Check for pulse animations
      const pulseElements = container.querySelectorAll(".animate-pulse");
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  describe("Props", () => {
    it("accepts lia as avatarId", () => {
      expect(() => render(<ChatInterfaceLazy avatarId="lia" />)).not.toThrow();
    });

    it("accepts mia as avatarId", () => {
      expect(() => render(<ChatInterfaceLazy avatarId="mia" />)).not.toThrow();
    });

    it("accepts allan as avatarId", () => {
      expect(() => render(<ChatInterfaceLazy avatarId="allan" />)).not.toThrow();
    });
  });

  describe("Accessibility", () => {
    it("loading state is accessible", () => {
      render(<ChatInterfaceLazy avatarId="lia" />);
      
      // PageLoading component should have proper accessibility
      const loadingElement = screen.getByText("Cargando chat...");
      expect(loadingElement).toBeVisible();
    });
  });

  describe("Styling", () => {
    it("applies glassmorphism styles to skeleton", () => {
      const { container } = render(<ChatInterfaceLazy avatarId="lia" />);
      
      // Check for bg-black/40 class on header/footer
      const darkBgElements = container.querySelectorAll('[class*="bg-black"]');
      expect(darkBgElements.length).toBeGreaterThan(0);
    });

    it("applies border styles", () => {
      const { container } = render(<ChatInterfaceLazy avatarId="lia" />);
      
      // Check for border classes
      const borderElements = container.querySelectorAll('[class*="border"]');
      expect(borderElements.length).toBeGreaterThan(0);
    });
  });
});

