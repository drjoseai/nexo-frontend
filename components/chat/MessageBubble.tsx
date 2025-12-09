// components/chat/MessageBubble.tsx
// Burbuja de mensaje para el chat de NEXO v2.0

"use client";

import { memo } from "react";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message, AvatarId } from "@/types/chat";

// ============================================
// AVATAR COLORS
// ============================================

const AVATAR_COLORS: Record<AvatarId, { gradient: string; glow: string }> = {
  lia: {
    gradient: "from-purple-500/20 to-purple-600/10",
    glow: "shadow-purple-500/20",
  },
  mia: {
    gradient: "from-amber-500/20 to-orange-600/10",
    glow: "shadow-amber-500/20",
  },
  allan: {
    gradient: "from-cyan-500/20 to-teal-600/10",
    glow: "shadow-cyan-500/20",
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
}

// ============================================
// STATUS ICON COMPONENT
// ============================================

function StatusIcon({ status }: { status: Message["status"] }) {
  switch (status) {
    case "sending":
      return <Clock className="h-3 w-3 animate-pulse text-white/40" />;
    case "sent":
      return <Check className="h-3 w-3 text-white/40" />;
    case "error":
      return <AlertCircle className="h-3 w-3 text-red-400" />;
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
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const avatarColors = AVATAR_COLORS[avatarId];

  return (
    <div
      className={cn(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar indicator (solo para mensajes del avatar) */}
      {!isUser && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            "bg-gradient-to-br text-xs font-semibold text-white",
            avatarColors.gradient,
            "border border-white/10"
          )}
        >
          {avatarName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Contenedor del mensaje */}
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Burbuja del mensaje */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? [
                  // Estilo usuario
                  "bg-primary text-white",
                  "rounded-br-md",
                ]
              : [
                  // Estilo avatar
                  "bg-gradient-to-br border border-white/10",
                  avatarColors.gradient,
                  "text-white/90",
                  "rounded-bl-md",
                  "shadow-lg",
                  avatarColors.glow,
                ],
            // Estado de error
            message.status === "error" && "opacity-70"
          )}
        >
          {/* Contenido del mensaje */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Metadata: timestamp y status */}
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-white/40",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          {/* Timestamp */}
          {showTimestamp && (
            <span>{formatTime(message.timestamp)}</span>
          )}

          {/* Status icon (solo para mensajes del usuario) */}
          {isUser && <StatusIcon status={message.status} />}

          {/* Error message */}
          {message.status === "error" && (
            <span className="text-red-400">Error al enviar</span>
          )}
        </div>
      </div>

      {/* Spacer para alinear mensajes del usuario */}
      {isUser && <div className="w-8 shrink-0" />}
    </div>
  );
});

export default MessageBubble;

