// __tests__/components/chat/chat-input.test.tsx
// Tests para ChatInput - NEXO v2.0 Frontend Sprint Day 7

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/components/chat/ChatInput";

// ============================================
// MOCK SETUP
// ============================================

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Send: () => <svg data-testid="send-icon" />,
}));

// ============================================
// TEST SUITE
// ============================================

describe("ChatInput", () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // RENDERING
  // ==========================================
  describe("Rendering", () => {
    it("renders textarea with default placeholder", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getByPlaceholderText("Escribe un mensaje...")).toBeInTheDocument();
    });

    it("renders textarea with custom placeholder", () => {
      render(<ChatInput onSend={mockOnSend} placeholder="Escribe a Lía..." />);
      
      expect(screen.getByPlaceholderText("Escribe a Lía...")).toBeInTheDocument();
    });

    it("renders send button", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getByRole("button", { name: /enviar mensaje/i })).toBeInTheDocument();
    });

    it("renders send icon inside button", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getByTestId("send-icon")).toBeInTheDocument();
    });

    it("renders keyboard hints on larger screens", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getAllByText(/Enter/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Shift \+ Enter/)).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <ChatInput onSend={mockOnSend} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  // ==========================================
  // SEND BEHAVIOR
  // ==========================================
  describe("Send Behavior", () => {
    it("calls onSend with message when button clicked", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "Hola Lía");
      
      const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
      await user.click(sendButton);
      
      expect(mockOnSend).toHaveBeenCalledWith("Hola Lía");
    });

    it("calls onSend when Enter is pressed (without Shift)", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "Mensaje de prueba{enter}");
      
      expect(mockOnSend).toHaveBeenCalledWith("Mensaje de prueba");
    });

    it("does NOT call onSend when Shift+Enter is pressed", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "Línea 1{shift>}{enter}{/shift}Línea 2");
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("clears textarea after sending", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...") as HTMLTextAreaElement;
      await user.type(textarea, "Mensaje");
      await user.click(screen.getByRole("button", { name: /enviar mensaje/i }));
      
      expect(textarea.value).toBe("");
    });

    it("trims whitespace before sending", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "   Mensaje con espacios   ");
      await user.click(screen.getByRole("button", { name: /enviar mensaje/i }));
      
      expect(mockOnSend).toHaveBeenCalledWith("Mensaje con espacios");
    });

    it("does NOT send empty message", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const sendButton = screen.getByRole("button", { name: /enviar mensaje/i });
      await user.click(sendButton);
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it("does NOT send whitespace-only message", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "   ");
      await user.click(screen.getByRole("button", { name: /enviar mensaje/i }));
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // DISABLED STATE
  // ==========================================
  describe("Disabled State", () => {
    it("disables textarea when disabled prop is true", () => {
      render(<ChatInput onSend={mockOnSend} disabled />);
      
      expect(screen.getByPlaceholderText("Escribe un mensaje...")).toBeDisabled();
    });

    it("disables send button when disabled prop is true", () => {
      render(<ChatInput onSend={mockOnSend} disabled />);
      
      expect(screen.getByRole("button", { name: /enviar mensaje/i })).toBeDisabled();
    });

    it("disables send button when textarea is empty", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getByRole("button", { name: /enviar mensaje/i })).toBeDisabled();
    });

    it("enables send button when textarea has content", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "Contenido");
      
      expect(screen.getByRole("button", { name: /enviar mensaje/i })).not.toBeDisabled();
    });

    it("does NOT send when disabled even with content", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "Mensaje");
      
      // Deshabilitar después de escribir
      rerender(<ChatInput onSend={mockOnSend} disabled />);
      
      // Intentar enviar con Enter
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      
      expect(mockOnSend).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // CHARACTER LIMIT
  // ==========================================
  describe("Character Limit", () => {
    it("uses default maxLength of 2000", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      fireEvent.change(textarea, { target: { value: "a".repeat(1900) } });
      
      expect(textarea).toHaveValue("a".repeat(1900));
    });

    it("respects custom maxLength", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} maxLength={100} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      const longText = "a".repeat(150);
      await user.type(textarea, longText);
      
      expect((textarea as HTMLTextAreaElement).value.length).toBe(100);
    });

    it("shows character counter when near limit (< 100 remaining)", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} maxLength={100} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "a".repeat(10)); // 90 remaining
      
      await waitFor(() => {
        expect(screen.getByText(/caracteres restantes/)).toBeInTheDocument();
      });
    });

    it("does NOT show character counter when far from limit", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} maxLength={2000} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "Hola"); // 1996 remaining
      
      expect(screen.queryByText(/caracteres restantes/)).not.toBeInTheDocument();
    });

    it("shows red color when very close to limit (< 20 remaining)", async () => {
      const user = userEvent.setup();
      render(<ChatInput onSend={mockOnSend} maxLength={50} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      await user.type(textarea, "a".repeat(35)); // 15 remaining
      
      await waitFor(
        () => {
          const counter = screen.getByText(/\d+ caracteres restantes/);
          expect(counter).toHaveClass("text-red-400");
        },
        { timeout: 5000 }
      );
    });
  });

  // ==========================================
  // ACCESSIBILITY
  // ==========================================
  describe("Accessibility", () => {
    it("send button has accessible name", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      expect(screen.getByRole("button", { name: /enviar mensaje/i })).toBeInTheDocument();
    });

    it("textarea is focusable", () => {
      render(<ChatInput onSend={mockOnSend} />);
      
      const textarea = screen.getByPlaceholderText("Escribe un mensaje...");
      textarea.focus();
      
      expect(document.activeElement).toBe(textarea);
    });
  });
});

