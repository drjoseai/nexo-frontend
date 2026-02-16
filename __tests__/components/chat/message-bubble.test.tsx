// __tests__/components/chat/message-bubble.test.tsx
// Tests para MessageBubble - NEXO v2.0 Frontend Sprint Day 7

import React from "react";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { Message } from "@/types/chat";

// ============================================
// MOCK SETUP
// ============================================

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Check: () => <svg data-testid="icon-check" />,
  Clock: () => <svg data-testid="icon-clock" />,
  AlertCircle: () => <svg data-testid="icon-alert" />,
}));

// Mock MessageAttachment
jest.mock("@/components/chat/MessageAttachment", () => ({
  MessageAttachment: ({ attachmentFilename }: { attachmentFilename: string }) => (
    <div data-testid="message-attachment">{attachmentFilename}</div>
  ),
}));

// ============================================
// HELPER FUNCTIONS
// ============================================

function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: "msg-1",
    role: "user",
    content: "Hola, ¿cómo estás?",
    timestamp: new Date("2025-12-12T10:30:00"),
    status: "sent",
    ...overrides,
  };
}

// ============================================
// TEST SUITE
// ============================================

describe("MessageBubble", () => {
  // ==========================================
  // RENDERING
  // ==========================================
  describe("Rendering", () => {
    it("renders message content", () => {
      const message = createMessage({ content: "Hola Lía" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByText("Hola Lía")).toBeInTheDocument();
    });

    it("renders timestamp by default", () => {
      const message = createMessage();
      render(<MessageBubble message={message} />);
      
      // Formato: HH:MM (hora española)
      expect(screen.getByText("10:30")).toBeInTheDocument();
    });

    it("hides timestamp when showTimestamp is false", () => {
      const message = createMessage();
      render(<MessageBubble message={message} showTimestamp={false} />);
      
      expect(screen.queryByText("10:30")).not.toBeInTheDocument();
    });

    it("renders multiline content with whitespace preserved", () => {
      const message = createMessage({ content: "Línea 1\nLínea 2\nLínea 3" });
      render(<MessageBubble message={message} />);
      
      const content = screen.getByText(/Línea 1/);
      expect(content).toHaveClass("whitespace-pre-wrap");
    });
  });

  // ==========================================
  // USER MESSAGES
  // ==========================================
  describe("User Messages", () => {
    it("renders user message aligned to the right", () => {
      const message = createMessage({ role: "user" });
      const { container } = render(<MessageBubble message={message} />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("justify-end");
    });

    it("does NOT show avatar indicator for user messages", () => {
      const message = createMessage({ role: "user" });
      render(<MessageBubble message={message} avatarName="Lía" />);
      
      // No debe mostrar la inicial del avatar
      const avatarIndicators = screen.queryAllByText("L");
      expect(avatarIndicators.length).toBe(0);
    });

    it("applies user bubble styling (bg-primary)", () => {
      const message = createMessage({ role: "user" });
      render(<MessageBubble message={message} />);
      
      const bubble = screen.getByText("Hola, ¿cómo estás?").closest("div");
      expect(bubble).toHaveClass("bg-primary");
    });

    it("shows status icon for user messages", () => {
      const message = createMessage({ role: "user", status: "sent" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });
  });

  // ==========================================
  // ASSISTANT MESSAGES
  // ==========================================
  describe("Assistant Messages", () => {
    it("renders assistant message aligned to the left", () => {
      const message = createMessage({ role: "assistant" });
      const { container } = render(<MessageBubble message={message} />);
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("justify-start");
    });

    it("shows avatar indicator with first letter of name", () => {
      const message = createMessage({ role: "assistant" });
      render(<MessageBubble message={message} avatarName="Lía" />);
      
      expect(screen.getByText("L")).toBeInTheDocument();
    });

    it("uses default avatar name when not provided", () => {
      const message = createMessage({ role: "assistant" });
      render(<MessageBubble message={message} />);
      
      // Default: "Avatar" -> "A"
      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("does NOT show status icon for assistant messages", () => {
      const message = createMessage({ role: "assistant", status: "sent" });
      render(<MessageBubble message={message} />);
      
      expect(screen.queryByTestId("icon-check")).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // AVATAR COLORS
  // ==========================================
  describe("Avatar Colors", () => {
    it("applies Lía colors (primary) for lia avatar", () => {
      const message = createMessage({ role: "assistant" });
      render(
        <MessageBubble message={message} avatarId="lia" avatarName="Lía" />
      );
      
      // Verificar que tiene clases de gradiente primary
      const avatarIndicator = screen.getByText("L").closest("div");
      expect(avatarIndicator?.className).toContain("primary");
    });

    it("applies Mía colors (amber) for mia avatar", () => {
      const message = createMessage({ role: "assistant" });
      render(
        <MessageBubble message={message} avatarId="mia" avatarName="Mía" />
      );
      
      const avatarIndicator = screen.getByText("M").closest("div");
      expect(avatarIndicator?.className).toContain("amber");
    });

    it("applies Allan colors (bronze) for allan avatar", () => {
      const message = createMessage({ role: "assistant" });
      render(
        <MessageBubble message={message} avatarId="allan" avatarName="Allan" />
      );
      
      const avatarIndicator = screen.getByText("A").closest("div");
      expect(avatarIndicator?.className).toContain("amber");
    });

    it("defaults to lia colors when avatarId not provided", () => {
      const message = createMessage({ role: "assistant" });
      render(
        <MessageBubble message={message} avatarName="Test" />
      );
      
      const avatarIndicator = screen.getByText("T").closest("div");
      expect(avatarIndicator?.className).toContain("primary");
    });
  });

  // ==========================================
  // MESSAGE STATUS
  // ==========================================
  describe("Message Status", () => {
    it("shows clock icon for sending status", () => {
      const message = createMessage({ role: "user", status: "sending" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByTestId("icon-clock")).toBeInTheDocument();
    });

    it("shows check icon for sent status", () => {
      const message = createMessage({ role: "user", status: "sent" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByTestId("icon-check")).toBeInTheDocument();
    });

    it("shows alert icon for error status", () => {
      const message = createMessage({ role: "user", status: "error" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByTestId("icon-alert")).toBeInTheDocument();
    });

    it("shows error message text for error status", () => {
      const message = createMessage({ role: "user", status: "error" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByText("Error al enviar")).toBeInTheDocument();
    });

    it("applies opacity to message bubble on error", () => {
      const message = createMessage({ role: "user", status: "error" });
      render(<MessageBubble message={message} />);
      
      const bubble = screen.getByText("Hola, ¿cómo estás?").closest("div");
      expect(bubble).toHaveClass("opacity-70");
    });
  });

  // ==========================================
  // EDGE CASES
  // ==========================================
  describe("Edge Cases", () => {
    it("handles very long messages", () => {
      const longContent = "A".repeat(1000);
      const message = createMessage({ content: longContent });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it("handles empty content gracefully", () => {
      const message = createMessage({ content: "" });
      const { container } = render(<MessageBubble message={message} />);
      
      // Should still render the bubble structure
      expect(container.firstChild).toBeInTheDocument();
    });

    it("handles special characters in content", () => {
      const message = createMessage({ content: "<script>alert('xss')</script>" });
      render(<MessageBubble message={message} />);
      
      // Should render as text, not execute
      expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
    });

    it("handles emojis in content", () => {
      const message = createMessage({ content: "Hola 👋 ¿Cómo estás? 😊" });
      render(<MessageBubble message={message} />);
      
      expect(screen.getByText("Hola 👋 ¿Cómo estás? 😊")).toBeInTheDocument();
    });
  });
});
