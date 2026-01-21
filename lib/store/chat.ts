// lib/store/chat.ts
// Zustand store para el sistema de chat de NEXO v2.0
// Maneja estado de mensajes, loading, errores y acciones

import { create } from "zustand";
import { chatApi } from "@/lib/api/chat";
import { analytics, AnalyticsEvents } from "@/lib/services/analytics";
import type {
  Message,
  AvatarId,
} from "@/types/chat";

// ============================================
// STORE STATE INTERFACE
// ============================================

interface ChatState {
  // Estado
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  currentAvatarId: AvatarId | null;
  messagesRemaining: number | null;
  
  // Acciones
  sendMessage: (content: string, avatarId: string, relationshipType?: string) => Promise<boolean>;
  loadHistory: (avatarId: string, limit?: number) => Promise<void>;
  deleteHistory: (avatarId: AvatarId) => Promise<void>;
  setCurrentAvatar: (avatarId: AvatarId) => void;
  clearMessages: () => void;
  clearError: () => void;
  addOptimisticMessage: (content: string) => string;
  updateMessageStatus: (messageId: string, status: Message["status"]) => void;
}

// ============================================
// HELPER: Generar ID único para mensajes
// ============================================

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useChatStore = create<ChatState>((set, get) => ({
  // Estado inicial
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  currentAvatarId: null,
  messagesRemaining: null,

  // ============================================
  // ACCIONES
  // ============================================

  /**
   * Establece el avatar actual para el chat
   */
  setCurrentAvatar: (avatarId: AvatarId) => {
    set({ currentAvatarId: avatarId });
  },

  /**
   * Agrega un mensaje optimista (antes de confirmar con el servidor)
   * Retorna el ID del mensaje para actualizarlo después
   */
  addOptimisticMessage: (content: string): string => {
    const messageId = generateMessageId();
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content,
      timestamp: new Date(),
      status: "sending",
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
    }));

    return messageId;
  },

  /**
   * Actualiza el status de un mensaje específico
   */
  updateMessageStatus: (messageId: string, status: Message["status"]) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  },

  /**
   * Envía un mensaje al avatar
   * Usa optimistic update para UX fluida
   */
  sendMessage: async (content: string, avatarId: string, relationshipType?: string): Promise<boolean> => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return false;

    // Optimistic update: agregar mensaje del usuario inmediatamente
    const userMessageId = get().addOptimisticMessage(trimmedContent);

    set({ isSending: true, error: null });

    try {
      // Llamar al API con relationship_type
      const response = await chatApi.sendMessage(avatarId, trimmedContent, relationshipType);

      if (!response.success) {
        // Manejar error del backend
        get().updateMessageStatus(userMessageId, "error");
        set({
          isSending: false,
          error: response.error || "Error al enviar mensaje",
        });
        return false;
      }

      // Marcar mensaje del usuario como enviado
      get().updateMessageStatus(userMessageId, "sent");

      // Agregar respuesta del avatar
      const avatarMessage: Message = {
        id: generateMessageId(), // Siempre generar ID único, ignorar response.id
        role: "assistant",
        content: response.avatar_response,
        timestamp: new Date(),
        status: "sent",
        metadata: {
          model_used: response.model_used,
          tokens_used: response.tokens_used,
          sentiment: response.sentiment_detected,
          emotional_depth: response.emotional_depth,
          cost: response.cost_estimate,
        },
      };

      set((state) => ({
        messages: [...state.messages, avatarMessage],
        isSending: false,
        messagesRemaining: response.messages_remaining ?? state.messagesRemaining,
      }));

      // Track message sent event
      analytics.track(AnalyticsEvents.MESSAGE_SENT, {
        avatar_id: avatarId,
        relationship_type: relationshipType,
        model_used: response.model_used,
        sentiment_detected: response.sentiment_detected,
      });
      analytics.increment('total_messages_sent');

      return true;
    } catch (error: unknown) {
      console.error("Error sending message:", error);

      // Marcar mensaje como error
      get().updateMessageStatus(userMessageId, "error");

      // Manejar diferentes tipos de error
      let errorMessage = "Error al enviar mensaje";

      if (error instanceof Error) {
        // Verificar si es error de rate limit (429)
        if (error.message.includes("429") || error.message.includes("limit")) {
          errorMessage = "Has alcanzado tu límite diario de mensajes";
        } else {
          errorMessage = error.message;
        }
      }

      set({
        isSending: false,
        error: errorMessage,
      });

      return false;
    }
  },

  /**
   * Carga el historial de conversación con un avatar
   */
  loadHistory: async (avatarId: string, limit: number = 20) => {
    set({ isLoading: true, error: null });

    try {
      const messages = await chatApi.getChatMessages(avatarId, limit);

      set({
        messages,
        isLoading: false,
        currentAvatarId: avatarId as AvatarId,
      });
    } catch (error: unknown) {
      console.error("Error loading chat history:", error);

      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Error al cargar historial",
      });
    }
  },

  /**
   * Limpia todos los mensajes (al cambiar de avatar)
   */
  clearMessages: () => {
    set({ messages: [], error: null });
  },

  /**
   * Limpia el error actual
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Borra el historial de chat permanentemente del servidor
   */
  deleteHistory: async (avatarId: AvatarId) => {
    try {
      // Llamar al API para borrar historial en el backend
      await chatApi.deleteHistory(avatarId);

      // Limpiar mensajes locales
      set({ messages: [], error: null });
    } catch (error) {
      console.error("[Chat] Error deleting history:", error);
      set({ error: "Error al borrar el historial" });
      throw error;
    }
  },
}));

// ============================================
// SELECTORES (para uso optimizado)
// ============================================

export const selectMessages = (state: ChatState) => state.messages;
export const selectIsLoading = (state: ChatState) => state.isLoading;
export const selectIsSending = (state: ChatState) => state.isSending;
export const selectError = (state: ChatState) => state.error;
export const selectMessagesRemaining = (state: ChatState) => state.messagesRemaining;

export default useChatStore;

