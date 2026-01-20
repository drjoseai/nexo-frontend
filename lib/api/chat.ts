// lib/api/chat.ts
// API service para el sistema de chat de NEXO v2.0
// Endpoints: POST /chat/message, GET /chat/history/{avatar_id}

import { apiClient } from "./client";
import type {
  ChatMessageRequest,
  ChatMessageResponse,
  ChatHistoryResponse,
  Message,
} from "@/types/chat";

// ============================================
// CHAT API FUNCTIONS
// ============================================

/**
 * Envía un mensaje al avatar y recibe la respuesta
 * Endpoint: POST /chat/message
 */
export async function sendMessage(
  avatarId: string,
  content: string,
  relationshipType?: string,
  language?: string
): Promise<ChatMessageResponse> {
  const request: ChatMessageRequest = {
    avatar_id: avatarId,
    content: content.trim(),
    relationship_type: relationshipType as ChatMessageRequest["relationship_type"],
    language: language as "es" | "en",
  };

  const response = await apiClient.post<ChatMessageResponse>(
    "/chat/message",
    request
  );

  return response.data;
}

/**
 * Obtiene el historial de conversación con un avatar
 * Endpoint: GET /chat/history/{avatar_id}
 */
export async function getChatHistory(
  avatarId: string,
  limit: number = 20
): Promise<ChatHistoryResponse> {
  const response = await apiClient.get<ChatHistoryResponse>(
    `/chat/history/${avatarId}`,
    {
      params: { limit },
    }
  );

  return response.data;
}

/**
 * Obtiene el historial formateado como Message[] para el UI
 * Wrapper conveniente que transforma HistoryMessage[] a Message[]
 */
export async function getChatMessages(
  avatarId: string,
  limit: number = 20
): Promise<Message[]> {
  const history = await getChatHistory(avatarId, limit);
  
  // Transformar historial del backend a formato de UI
  // Ordenar por timestamp ascendente (mensajes antiguos primero, recientes al final)
  return history.history
    .map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      status: "sent" as const,
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// ============================================
// CHAT API OBJECT (alternativa para imports)
// ============================================

export const chatApi = {
  sendMessage,
  getChatHistory,
  getChatMessages,
};

export default chatApi;

