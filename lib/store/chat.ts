// lib/store/chat.ts
// Zustand store para el sistema de chat de NEXO v2.0
// Maneja estado de mensajes, loading, errores y acciones

import { create } from "zustand";
import { chatApi } from "@/lib/api/chat";
import { fileApi } from "@/lib/api/files";
import type { UploadLimitsResponse } from "@/lib/api/files";
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
  uploadLimits: UploadLimitsResponse | null;
  fileUploading: boolean;
  
  // Acciones
  sendMessage: (content: string, avatarId: string, relationshipType?: string, pendingFile?: File | null) => Promise<boolean>;
  loadHistory: (avatarId: string, limit?: number) => Promise<void>;
  deleteHistory: (avatarId: AvatarId) => Promise<void>;
  setCurrentAvatar: (avatarId: AvatarId) => void;
  clearMessages: () => void;
  clearError: () => void;
  addOptimisticMessage: (content: string, attachment?: { url: string; type: string; filename: string }) => string;
  updateMessageStatus: (messageId: string, status: Message["status"]) => void;
  fetchUploadLimits: () => Promise<void>;
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
  uploadLimits: null,
  fileUploading: false,

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
  addOptimisticMessage: (content: string, attachment?: { url: string; type: string; filename: string }): string => {
    const messageId = generateMessageId();
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content,
      timestamp: new Date(),
      status: "sending",
      ...(attachment && {
        attachment_url: attachment.url,
        attachment_type: attachment.type as "image" | "text",
        attachment_filename: attachment.filename,
      }),
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
  sendMessage: async (content: string, avatarId: string, relationshipType?: string, pendingFile?: File | null): Promise<boolean> => {
    const trimmedContent = content.trim();
    
    // Permitir envío si hay contenido O hay archivo adjunto
    if (!trimmedContent && !pendingFile) return false;

    // Crear preview local si hay archivo de imagen pendiente
    let optimisticAttachment: { url: string; type: string; filename: string } | undefined;
    if (pendingFile && pendingFile.type.startsWith("image/")) {
      optimisticAttachment = {
        url: URL.createObjectURL(pendingFile),
        type: "image",
        filename: pendingFile.name,
      };
    }

    // Optimistic update: agregar mensaje del usuario inmediatamente (con preview si hay imagen)
    const userMessageId = get().addOptimisticMessage(
      trimmedContent || (pendingFile ? "" : ""),
      optimisticAttachment
    );

    set({ isSending: true, error: null });

    try {
      let attachmentData: {
        attachment_url: string;
        attachment_type: "image" | "text";
        attachment_filename: string;
        attachment_storage_path: string;
        extracted_text?: string;
      } | undefined = undefined;

      // Si hay archivo pendiente, subirlo primero
      if (pendingFile) {
        set({ fileUploading: true });
        try {
          const uploadResponse = await fileApi.uploadFile(pendingFile, avatarId);
          attachmentData = {
            attachment_url: uploadResponse.signed_url,
            attachment_type: uploadResponse.file_category as "image" | "text",
            attachment_filename: uploadResponse.filename,
            attachment_storage_path: uploadResponse.storage_path,
            extracted_text: uploadResponse.extracted_text,
          };
        } catch (uploadError) {
          console.error("File upload failed:", uploadError);
          // Revocar blob URL si existe
          if (optimisticAttachment?.url) {
            URL.revokeObjectURL(optimisticAttachment.url);
          }
          get().updateMessageStatus(userMessageId, "error");
          set({ isSending: false, fileUploading: false, error: "Error al subir el archivo. Intenta de nuevo." });
          return false;
        } finally {
          set({ fileUploading: false });
        }
      }

      // Llamar al API de chat con attachment data
      const response = await chatApi.sendMessage(avatarId, trimmedContent, relationshipType, undefined, attachmentData);

      if (!response.success) {
        // Manejar error del backend
        get().updateMessageStatus(userMessageId, "error");
        set({
          isSending: false,
          error: response.error || "Error al enviar mensaje",
        });
        return false;
      }

      // Actualizar mensaje del usuario con attachment info real (reemplaza blob URL)
      if (attachmentData) {
        // Revocar blob URL para liberar memoria
        if (optimisticAttachment?.url) {
          URL.revokeObjectURL(optimisticAttachment.url);
        }
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === userMessageId
              ? {
                  ...msg,
                  status: "sent" as const,
                  content: trimmedContent || "",
                  attachment_url: attachmentData!.attachment_url,
                  attachment_type: attachmentData!.attachment_type,
                  attachment_filename: attachmentData!.attachment_filename,
                  attachment_storage_path: attachmentData!.attachment_storage_path,
                }
              : msg
          ),
        }));
      } else {
        // Marcar mensaje del usuario como enviado
        get().updateMessageStatus(userMessageId, "sent");
      }

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

      // Decrementar upload limits localmente
      if (attachmentData) {
        set((state) => ({
          uploadLimits: state.uploadLimits
            ? {
                ...state.uploadLimits,
                used: state.uploadLimits.used + 1,
                remaining: Math.max(0, state.uploadLimits.remaining - 1),
              }
            : null,
        }));
      }

      // Track message sent event
      analytics.track(AnalyticsEvents.MESSAGE_SENT, {
        avatar_id: avatarId,
        relationship_type: relationshipType,
        model_used: response.model_used,
        sentiment_detected: response.sentiment_detected,
        has_attachment: !!attachmentData,
      });
      analytics.increment('total_messages_sent');

      return true;
    } catch (error: unknown) {
      console.error("Error sending message:", error);

      // Marcar mensaje como error
      get().updateMessageStatus(userMessageId, "error");

      // Manejar diferentes tipos de error
      let errorMessage = "Error al enviar mensaje";
      let limitInfo = null;

      // Verificar si es objeto de error estructurado (del interceptor)
      if (error && typeof error === 'object') {
        const err = error as Record<string, unknown>;
        
        // Error 429 - Límite diario alcanzado
        if (err.status === 429 || err.code === 'daily_limit_exceeded') {
          limitInfo = err.limit_info as Record<string, unknown> | null;
          
          if (limitInfo?.resets_at_formatted) {
            errorMessage = `Has alcanzado tu límite de ${limitInfo.limit || 'mensajes'} mensajes diarios. Tu cuota se reinicia a las ${limitInfo.resets_at_formatted}.`;
          } else if (limitInfo?.resets_at) {
            // Formatear la hora si solo tenemos ISO string
            const resetTime = new Date(limitInfo.resets_at as string);
            const timeStr = resetTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
            errorMessage = `Has alcanzado tu límite de ${limitInfo.limit || 'mensajes'} mensajes diarios. Tu cuota se reinicia a las ${timeStr}.`;
          } else {
            errorMessage = (err.message as string) || "Has alcanzado tu límite diario de mensajes";
          }
          
          // Actualizar mensajes restantes a 0
          set({ messagesRemaining: 0 });
        }
        // Otros errores con mensaje
        else if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        }
        // Error de respuesta del backend (success: false)
        else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        }
      }
      // Error estándar de JavaScript
      else if (error instanceof Error) {
        errorMessage = error.message;
      }

      set({
        isSending: false,
        error: errorMessage,
      });

      // Track error event
      analytics.track(AnalyticsEvents.ERROR_OCCURRED, {
        error_type: limitInfo ? 'daily_limit_exceeded' : 'send_message_error',
        error_message: errorMessage,
      });

      return false;
    }
  },

  /**
   * Obtiene los límites de upload del usuario actual
   */
  fetchUploadLimits: async () => {
    try {
      const limits = await fileApi.getUploadLimits();
      set({ uploadLimits: limits });
    } catch (error) {
      console.error("Error fetching upload limits:", error);
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
export const selectUploadLimits = (state: ChatState) => state.uploadLimits;
export const selectFileUploading = (state: ChatState) => state.fileUploading;

export default useChatStore;

