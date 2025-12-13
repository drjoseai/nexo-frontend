// __tests__/components/chat/chat-interface.test.tsx
// Tests para ChatInterface - NEXO v2.0 Frontend Sprint Day 7

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import type { Message } from "@/types/chat";

// ============================================
// MOCK SETUP
// ============================================

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <svg data-testid="icon-arrow-left" />,
  Loader2: () => <svg data-testid="icon-loader" />,
}));

// Mock ChatInput
jest.mock("@/components/chat/ChatInput", () => ({
  ChatInput: ({ onSend, disabled, placeholder }: { 
    onSend: (msg: string) => void; 
    disabled?: boolean; 
    placeholder?: string;
  }) => (
    <div data-testid="chat-input">
      <input
        data-testid="chat-input-field"
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === "SEND_TEST") {
            onSend("Test message");
          }
        }}
      />
    </div>
  ),
}));

// Mock MessageBubble
jest.mock("@/components/chat/MessageBubble", () => ({
  MessageBubble: ({ message }: { 
    message: Message; 
    avatarId?: string;
    avatarName?: string;
  }) => (
    <div data-testid={`message-${message.id}`} data-role={message.role}>
      {message.content}
    </div>
  ),
}));

// Mock store state
const mockStoreState = {
  messages: [] as Message[],
  isLoading: false,
  isSending: false,
  error: null as string | null,
  messagesRemaining: null as number | null,
  sendMessage: jest.fn(),
  loadHistory: jest.fn(),
  clearMessages: jest.fn(),
  clearError: jest.fn(),
};

// Mock useChatStore
jest.mock("@/lib/store/chat", () => ({
  useChatStore: () => mockStoreState,
}));

// ============================================
// HELPER FUNCTIONS
// ============================================

function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: `msg-${Math.random().toString(36).substr(2, 9)}`,
    role: "user",
    content: "Test message",
    timestamp: new Date(),
    status: "sent",
    ...overrides,
  };
}

function resetMockStore() {
  mockStoreState.messages = [];
  mockStoreState.isLoading = false;
  mockStoreState.isSending = false;
  mockStoreState.error = null;
  mockStoreState.messagesRemaining = null;
  mockStoreState.sendMessage.mockClear();
  mockStoreState.loadHistory.mockClear();
  mockStoreState.clearMessages.mockClear();
  mockStoreState.clearError.mockClear();
}

// ============================================
// TEST SUITE
// ============================================

describe("ChatInterface", () => {
  beforeEach(() => {
    resetMockStore();
  });

  // ==========================================
  // HEADER
  // ==========================================
  describe("Header", () => {
    it("renders back button linking to dashboard", () => {
      render(<ChatInterface avatarId="lia" />);
      
      const backLink = screen.getByRole("link");
      expect(backLink).toHaveAttribute("href", "/dashboard");
    });

    it("renders avatar name for Lía", () => {
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText("Lía")).toBeInTheDocument();
    });

    it("renders avatar name for Mía", () => {
      render(<ChatInterface avatarId="mia" />);
      
      expect(screen.getByText("Mía")).toBeInTheDocument();
    });

    it("renders avatar name for Allan", () => {
      render(<ChatInterface avatarId="allan" />);
      
      expect(screen.getByText("Allan")).toBeInTheDocument();
    });

    it("shows 'En línea' status when not sending", () => {
      mockStoreState.isSending = false;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText("En línea")).toBeInTheDocument();
    });

    it("shows 'Escribiendo...' status when sending", () => {
      mockStoreState.isSending = true;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText("Escribiendo...")).toBeInTheDocument();
    });

    it("shows messages remaining when available", () => {
      mockStoreState.messagesRemaining = 42;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText("42 mensajes restantes")).toBeInTheDocument();
    });

    it("does not show messages remaining when null", () => {
      mockStoreState.messagesRemaining = null;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.queryByText(/mensajes restantes/)).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // LOADING STATE
  // ==========================================
  describe("Loading State", () => {
    it("shows loader when isLoading is true", () => {
      mockStoreState.isLoading = true;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
    });

    it("does not show messages when loading", () => {
      mockStoreState.isLoading = true;
      mockStoreState.messages = [createMessage({ id: "1", content: "Hello" })];
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.queryByTestId("message-1")).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // EMPTY STATE
  // ==========================================
  describe("Empty State", () => {
    it("shows empty state when no messages and not loading", () => {
      mockStoreState.isLoading = false;
      mockStoreState.messages = [];
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText(/Inicia una conversación con/)).toBeInTheDocument();
    });

    it("shows avatar name in empty state", () => {
      mockStoreState.messages = [];
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText(/Inicia una conversación con Lía/)).toBeInTheDocument();
    });

    it("shows avatar description in empty state", () => {
      mockStoreState.messages = [];
      render(<ChatInterface avatarId="lia" />);
      
      // Lía's description contains "empática"
      expect(screen.getByText(/empática/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // MESSAGES LIST
  // ==========================================
  describe("Messages List", () => {
    it("renders messages when available", () => {
      mockStoreState.messages = [
        createMessage({ id: "1", role: "user", content: "Hola" }),
        createMessage({ id: "2", role: "assistant", content: "¡Hola!" }),
      ];
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByTestId("message-1")).toBeInTheDocument();
      expect(screen.getByTestId("message-2")).toBeInTheDocument();
    });

    it("renders messages in correct order", () => {
      mockStoreState.messages = [
        createMessage({ id: "1", content: "First" }),
        createMessage({ id: "2", content: "Second" }),
        createMessage({ id: "3", content: "Third" }),
      ];
      render(<ChatInterface avatarId="lia" />);
      
      const messages = screen.getAllByTestId(/message-/);
      expect(messages).toHaveLength(3);
      expect(messages[0]).toHaveTextContent("First");
      expect(messages[1]).toHaveTextContent("Second");
      expect(messages[2]).toHaveTextContent("Third");
    });

    it("shows typing indicator when isSending", () => {
      mockStoreState.isSending = true;
      mockStoreState.messages = [createMessage({ id: "1" })];
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText(/está escribiendo/)).toBeInTheDocument();
    });
  });

  // ==========================================
  // ERROR HANDLING
  // ==========================================
  describe("Error Handling", () => {
    it("shows error banner when error exists", () => {
      mockStoreState.error = "No se pudo enviar el mensaje";
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByText("No se pudo enviar el mensaje")).toBeInTheDocument();
    });

    it("shows close button in error banner", () => {
      mockStoreState.error = "Error de red";
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByRole("button", { name: /cerrar/i })).toBeInTheDocument();
    });

    it("calls clearError when close button clicked", () => {
      mockStoreState.error = "Error de red";
      render(<ChatInterface avatarId="lia" />);
      
      fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
      
      expect(mockStoreState.clearError).toHaveBeenCalled();
    });

    it("does not show error banner when error is null", () => {
      mockStoreState.error = null;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.queryByRole("button", { name: /cerrar/i })).not.toBeInTheDocument();
    });
  });

  // ==========================================
  // INPUT AREA
  // ==========================================
  describe("Input Area", () => {
    it("renders ChatInput component", () => {
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    });

    it("disables input when isSending", () => {
      mockStoreState.isSending = true;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByTestId("chat-input-field")).toBeDisabled();
    });

    it("disables input when isLoading", () => {
      mockStoreState.isLoading = true;
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByTestId("chat-input-field")).toBeDisabled();
    });

    it("shows avatar name in placeholder", () => {
      render(<ChatInterface avatarId="lia" />);
      
      expect(screen.getByPlaceholderText(/Escribe a Lía/)).toBeInTheDocument();
    });
  });

  // ==========================================
  // STORE INTERACTIONS
  // ==========================================
  describe("Store Interactions", () => {
    it("calls clearMessages on mount", () => {
      render(<ChatInterface avatarId="lia" />);
      
      expect(mockStoreState.clearMessages).toHaveBeenCalled();
    });

    it("calls loadHistory with avatarId on mount", () => {
      render(<ChatInterface avatarId="mia" />);
      
      expect(mockStoreState.loadHistory).toHaveBeenCalledWith("mia");
    });

    it("calls sendMessage when message sent", async () => {
      render(<ChatInterface avatarId="lia" />);
      
      // Trigger send via mock ChatInput
      const input = screen.getByTestId("chat-input-field");
      fireEvent.change(input, { target: { value: "SEND_TEST" } });
      
      await waitFor(() => {
        expect(mockStoreState.sendMessage).toHaveBeenCalledWith("Test message", "lia");
      });
    });
  });

  // ==========================================
  // AVATAR-SPECIFIC STYLING
  // ==========================================
  describe("Avatar-Specific Styling", () => {
    it("applies purple color class for Lía", () => {
      render(<ChatInterface avatarId="lia" />);
      
      const avatarName = screen.getByText("Lía");
      expect(avatarName).toHaveClass("text-purple-400");
    });

    it("applies amber color class for Mía", () => {
      render(<ChatInterface avatarId="mia" />);
      
      const avatarName = screen.getByText("Mía");
      expect(avatarName).toHaveClass("text-amber-400");
    });

    it("applies cyan color class for Allan", () => {
      render(<ChatInterface avatarId="allan" />);
      
      const avatarName = screen.getByText("Allan");
      expect(avatarName).toHaveClass("text-cyan-400");
    });
  });
});

