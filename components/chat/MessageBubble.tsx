// components/chat/MessageBubble.tsx
// Burbuja de mensaje estilo WhatsApp para NEXO v2.0

"use client";

import { memo } from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageAttachment } from "./MessageAttachment";
import type { Message, AvatarId } from "@/types/chat";

// ============================================
// AVATAR COLORS
// ============================================

const AVATAR_COLORS: Record<AvatarId, { 
  bgLight: string;
  bgDark: string;
  glowLight: string;
  glowDark: string;
}> = {
  lia: {
    bgLight: "bg-primary/10 border-primary/20",
    bgDark: "bg-gradient-to-br from-primary/85 to-primary/65 border-white/15",
    glowLight: "shadow-primary/20",
    glowDark: "shadow-primary/30",
  },
  mia: {
    bgLight: "bg-amber-100 border-amber-200",
    bgDark: "bg-gradient-to-br from-[var(--mia)]/85 to-[var(--mia)]/65 border-white/15",
    glowLight: "shadow-amber-200/50",
    glowDark: "shadow-[var(--mia)]/30",
  },
  allan: {
    bgLight: "bg-amber-100 border-amber-200",
    bgDark: "bg-gradient-to-br from-[var(--allan)]/90 to-[var(--allan)]/70 border-white/15",
    glowLight: "shadow-amber-200/50",
    glowDark: "shadow-[var(--allan)]/30",
  },
};

// ============================================
// PROPS INTERFACE
// ============================================

interface MessageBubbleProps {
  message: Message;
  avatarId?: AvatarId;
  avatarName?: string;
  showTimestamp?: boolean;
  isStreaming?: boolean;
}

// ============================================
// STATUS ICON COMPONENT
// ============================================

function StatusIcon({ status }: { status: Message["status"] }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 animate-pulse" />;
    case "sent":
      return <Check className="h-3 w-3" />;
    case "error":
      return null;
    default:
      return null;
  }
}

// ============================================
// FORMAT TIME HELPER
// ============================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// COMPONENT
// ============================================

export const MessageBubble = memo(function MessageBubble({
  message,
  avatarId = "lia",
  avatarName = "Avatar",
  showTimestamp = true,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatarColors = AVATAR_COLORS[avatarId];

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar indicator (solo para mensajes del avatar) */}
      {!isUser && (
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-auto mb-6",
            "text-[10px] font-semibold",
            "bg-gradient-to-br text-white border border-white/10",
            avatarId === "lia" && "from-primary/40 to-primary/20",
            avatarId === "mia" && "from-amber-400/40 to-[var(--mia)]/20",
            avatarId === "allan" && "from-amber-500/40 to-[var(--allan)]/20"
          )}
        >
          {avatarName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Burbuja del mensaje */}
      <div
        className={cn(
          "relative max-w-[85%] sm:max-w-[70%] rounded-2xl text-sm leading-relaxed",
          message.attachment_url && message.attachment_type === "image"
            ? "pb-1.5 pt-1 px-1.5"
            : "px-3 pt-2 pb-1.5",
          isUser
            ? "rounded-br-sm"
            : "rounded-bl-sm",
          isUser
            ? [
                "bg-primary text-primary-foreground",
              ]
            : [
                "border shadow-lg",
                avatarColors.bgLight,
                avatarColors.glowLight,
                "text-gray-800",
                avatarColors.bgDark,
                avatarColors.glowDark,
                "dark:text-white",
              ],
          message.status === "error" && "opacity-70"
        )}
      >
        {/* Attachment (si existe) */}
        {message.attachment_url && message.attachment_type && (
          <div className="overflow-hidden rounded-xl mb-1">
            <MessageAttachment
              attachmentUrl={message.attachment_url}
              attachmentType={message.attachment_type}
              attachmentFilename={message.attachment_filename || "archivo"}
              storagePath={message.attachment_storage_path}
            />
          </div>
        )}

        {/* Contenido del mensaje con timestamp inline */}
        {message.content && (
          <p className="whitespace-pre-wrap break-words">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-current opacity-60 animate-pulse ml-0.5 align-text-bottom" />
            )}
            {/* Spacer invisible para que el timestamp no se sobreponga al texto */}
            {showTimestamp && !isStreaming && (
              <span className={cn(
                "inline-block align-baseline",
                isUser ? "w-[60px]" : "w-[44px]"
              )} />
            )}
          </p>
        )}

        {/* Animación "pensando" mientras espera primer token del modelo */}
        {isStreaming && !message.content && (
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-current opacity-40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Timestamp + Status DENTRO de la burbuja (estilo WhatsApp) */}
        {showTimestamp && !isStreaming && (
          <div
            className={cn(
              "flex items-center gap-1 justify-end mt-0.5",
              isUser
                ? "text-primary-foreground/60"
                : "text-current opacity-40"
            )}
          >
            <span className="text-[10px] leading-none">
              {formatTime(message.timestamp)}
            </span>
            {isUser && <StatusIcon status={message.status} />}
          </div>
        )}

        {/* Error message */}
        {message.status === "error" && (
          <div className="flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3 text-red-300" />
            <span className="text-[10px] text-red-300">Error al enviar</span>
          </div>
        )}
      </div>

      {/* Spacer para alinear mensajes del usuario */}
      {isUser && <div className="w-7 shrink-0" />}
    </div>
  );
});

export default MessageBubble;
