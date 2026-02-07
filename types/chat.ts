// types/chat.ts
// Tipos para el sistema de chat de NEXO v2.0
// Alineados con backend: app/schemas/chat.py

// ============================================
// REQUEST TYPES
// ============================================

export interface ChatMessageRequest {
  avatar_id: string;
  content: string;
  relationship_type?: RelationshipType;
  language?: "es" | "en";
  attachment_url?: string;
  attachment_type?: "image" | "text";
  attachment_filename?: string;
  attachment_storage_path?: string;
  extracted_text?: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ChatMessageResponse {
  id: string;
  response: string;
  avatar_response: string;
  model_used: string;
  tokens_used?: number;
  sentiment_detected?: SentimentType;
  emotional_depth?: number;
  relationship_depth?: number;
  messages_remaining?: number;
  cost_estimate?: number;
  cache_used: boolean;
  success: boolean;
  error?: string;
  is_romantic?: boolean;
  attachment_url?: string;
  attachment_type?: "image" | "text";
  attachment_filename?: string;
}

export interface ChatHistoryResponse {
  avatar_id: string;
  history: HistoryMessage[];
  total_messages: number;
}

export interface HistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  conversation_id: string;
  attachment_url?: string;
  attachment_type?: "image" | "text";
  attachment_filename?: string;
  attachment_storage_path?: string;
}

// ============================================
// UI MESSAGE TYPES (for frontend state)
// ============================================

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: MessageStatus;
  metadata?: MessageMetadata;
  attachment_url?: string;
  attachment_type?: "image" | "text";
  attachment_filename?: string;
  attachment_storage_path?: string;
}

export interface MessageMetadata {
  model_used?: string;
  tokens_used?: number;
  sentiment?: SentimentType;
  emotional_depth?: number;
  cost?: number;
}

export type MessageStatus = "sending" | "sent" | "error";

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type RelationshipType = "assistant" | "friend" | "confidant" | "romantic";

export type SentimentType = "positive" | "neutral" | "negative";

export type AvatarId = "lia" | "mia" | "allan";

// ============================================
// CHAT STATE (for Zustand store)
// ============================================

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentAvatarId: AvatarId | null;
  messagesRemaining: number | null;
}

export interface ChatActions {
  sendMessage: (content: string, avatarId: string) => Promise<void>;
  loadHistory: (avatarId: string) => Promise<void>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

// ============================================
// API ERROR TYPES
// ============================================

export interface ChatError {
  message: string;
  code?: string;
  remaining?: number;
  upgrade_url?: string;
}

export interface RateLimitError {
  message: string;
  remaining: number;
  upgrade_url: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isRateLimitError(error: unknown): error is RateLimitError {
  return (
    typeof error === "object" &&
    error !== null &&
    "remaining" in error &&
    "upgrade_url" in error
  );
}

export function historyToMessages(history: HistoryMessage[]): Message[] {
  return history.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    status: "sent" as MessageStatus,
    attachment_url: msg.attachment_url,
    attachment_type: msg.attachment_type,
    attachment_filename: msg.attachment_filename,
    attachment_storage_path: msg.attachment_storage_path,
  }));
}

