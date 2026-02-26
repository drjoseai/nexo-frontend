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
  language?: string,
  attachmentData?: {
    attachment_url: string;
    attachment_type: "image" | "text";
    attachment_filename: string;
    attachment_storage_path: string;
    extracted_text?: string;
  }
): Promise<ChatMessageResponse> {
  const request: ChatMessageRequest = {
    avatar_id: avatarId,
    content: content.trim(),
    relationship_type: relationshipType as ChatMessageRequest["relationship_type"],
    language: language as "es" | "en",
    ...(attachmentData && {
      attachment_url: attachmentData.attachment_url,
      attachment_type: attachmentData.attachment_type,
      attachment_filename: attachmentData.attachment_filename,
      attachment_storage_path: attachmentData.attachment_storage_path,
      extracted_text: attachmentData.extracted_text,
    }),
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
  limit: number = 20,
  relationshipType?: string
): Promise<ChatHistoryResponse> {
  const params: Record<string, string | number> = { limit };
  if (relationshipType) {
    params.relationship_type = relationshipType;
  }

  const response = await apiClient.get<ChatHistoryResponse>(
    `/chat/history/${avatarId}`,
    { params }
  );

  return response.data;
}

/**
 * Obtiene el historial formateado como Message[] para el UI
 * Wrapper conveniente que transforma HistoryMessage[] a Message[]
 */
export async function getChatMessages(
  avatarId: string,
  limit: number = 20,
  relationshipType?: string
): Promise<Message[]> {
  const history = await getChatHistory(avatarId, limit, relationshipType);
  
  // Transformar historial del backend a formato de UI
  // Ordenar por timestamp ascendente (mensajes antiguos primero, recientes al final)
  return history.history
    .map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      status: "sent" as const,
      attachment_url: msg.attachment_url,
      attachment_type: msg.attachment_type,
      attachment_filename: msg.attachment_filename,
      attachment_storage_path: msg.attachment_storage_path,
    }))
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/**
 * Borra el historial de conversación con un avatar
 * Endpoint: DELETE /chat/history/{avatar_id}
 */
export async function deleteHistory(
  avatarId: string,
  relationshipType?: string
): Promise<void> {
  let url = `/chat/history/${avatarId}`;
  if (relationshipType) {
    url += `?relationship_type=${relationshipType}`;
  }
  await apiClient.delete(url);
}

// ============================================
// STREAMING API (SSE)
// ============================================

/**
 * Tipos para eventos SSE del streaming
 */
export interface StreamCallbacks {
  onStart?: (data: { avatar_id: string; avatar_name: string; relationship_type: string }) => void;
  onContent?: (text: string) => void;
  onMetadata?: (data: { tokens: number; cost: number; model: string; duration_ms: number; cache_hit: boolean }) => void;
  onComplete?: (data: { message_id: string; conversation_id: string }) => void;
  onError?: (data: { message: string; error_type?: string; retry_after?: number; daily_limit?: number; boost_available?: boolean; mi_persona_remaining?: number }) => void;
}

/**
 * Envía un mensaje al avatar usando streaming SSE
 * Endpoint: POST /chat/message/stream
 *
 * Usa fetch() nativo (no Axios) porque necesitamos ReadableStream para SSE.
 * Auth se maneja via cookies httpOnly con credentials: "include".
 */
export async function sendMessageStream(
  avatarId: string,
  content: string,
  relationshipType?: string,
  callbacks?: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const request: ChatMessageRequest = {
    avatar_id: avatarId,
    content: content.trim(),
    relationship_type: relationshipType as ChatMessageRequest["relationship_type"],
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${apiUrl}/chat/message/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(request),
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorDetail = errorData.detail || errorData;
    throw {
      status: response.status,
      message: typeof errorDetail === "string" ? errorDetail : errorDetail?.message || `Error ${response.status}`,
      code: response.status === 429 ? "daily_limit_exceeded" : undefined,
      limit_info: errorDetail?.limit_info || null,
      ...errorData,
    };
  }

  if (!response.body) {
    throw new Error("Response body is null — streaming not supported by browser");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events: "event: type\ndata: {json}\n\n"
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const eventStr of events) {
        if (!eventStr.trim()) continue;

        const lines = eventStr.split("\n");
        let eventType = "";
        let eventData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            eventData = line.slice(6).trim();
          }
        }

        if (!eventType || !eventData) continue;

        try {
          const parsed = JSON.parse(eventData);
          const data = parsed.data || parsed;

          switch (eventType) {
            case "start":
              callbacks?.onStart?.(data);
              break;
            case "content":
              callbacks?.onContent?.(data.text || "");
              // Yield al event loop para que React renderice el texto progresivamente
              // Sin esto, React 18 batchea todos los set() y el texto aparece de golpe
              await new Promise(resolve => requestAnimationFrame(resolve));
              break;
            case "metadata":
              callbacks?.onMetadata?.(data);
              break;
            case "complete":
              callbacks?.onComplete?.(data);
              break;
            case "error":
              callbacks?.onError?.(data);
              break;
          }
        } catch {
          console.warn("[SSE] Failed to parse event:", eventType, eventData);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Borra TODAS las conversaciones, memories y summaries del usuario.
 * Resetea relaciones con avatares. Cuenta y suscripción se mantienen.
 * Endpoint: DELETE /chat/history/clear-all
 */
export async function clearAllData(): Promise<{ success: boolean; deleted: { conversations: number; summaries: number; memories: number; relationships_reset: number } }> {
  const response = await apiClient.delete<{ success: boolean; deleted: { conversations: number; summaries: number; memories: number; relationships_reset: number } }>(
    "/chat/history/clear-all"
  );
  return response.data;
}

export async function exportUserData(): Promise<Blob> {
  const response = await apiClient.get("/api/v1/auth/export-data");
  const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: "application/json" });
  return blob;
}

// ============================================
// CHAT API OBJECT (alternativa para imports)
// ============================================

export const chatApi = {
  sendMessage,
  sendMessageStream,
  getChatHistory,
  getChatMessages,
  deleteHistory,
  clearAllData,
  exportUserData,
};

export default chatApi;

