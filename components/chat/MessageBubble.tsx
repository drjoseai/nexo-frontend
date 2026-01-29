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

const AVATAR_COLORS: Record<AvatarId, { 
  bgLight: string;
  bgDark: string;
  glowLight: string;
  glowDark: string;
}> = {
  lia: {
    bgLight: "bg-purple-100 border-purple-200",
    bgDark: "dark:bg-gradient-to-br dark:from-purple-500/55 dark:to-purple-600/40 dark:border-white/10",
    glowLight: "shadow-purple-200/50",
    glowDark: "dark:shadow-purple-500/20",
  },
  mia: {
    bgLight: "bg-amber-100 border-amber-200",
    bgDark: "dark:bg-gradient-to-br dark:from-amber-500/65 dark:to-orange-600/50 dark:border-white/10",
    glowLight: "shadow-amber-200/50",
    glowDark: "dark:shadow-amber-500/20",
  },
  allan: {
    bgLight: "bg-cyan-100 border-cyan-200",
    bgDark: "dark:bg-gradient-to-br dark:from-cyan-500/55 dark:to-teal-600/40 dark:border-white/10",
    glowLight: "shadow-cyan-200/50",
    glowDark: "dark:shadow-cyan-500/20",
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
      return <Clock className="h-3 w-3 animate-pulse text-muted-foreground" />;
    case "sent":
      return <Check className="h-3 w-3 text-muted-foreground" />;
    case "error":
      return <AlertCircle className="h-3 w-3 text-red-500 dark:text-red-400" />;
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
            "text-xs font-semibold",
            // Light mode
            "bg-purple-100 text-purple-700 border border-purple-200",
            // Dark mode
            "dark:bg-gradient-to-br dark:text-white dark:border-white/10",
            avatarId === "lia" && "dark:from-purple-500/30 dark:to-purple-600/20",
            avatarId === "mia" && "bg-amber-100 text-amber-700 border-amber-200 dark:from-amber-500/30 dark:to-orange-600/20",
            avatarId === "allan" && "bg-cyan-100 text-cyan-700 border-cyan-200 dark:from-cyan-500/30 dark:to-teal-600/20"
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
                  // Usuario - Light mode
                  "bg-primary text-primary-foreground",
                  "rounded-br-md",
                ]
              : [
                  // Avatar - Light mode
                  "border rounded-bl-md shadow-lg",
                  avatarColors.bgLight,
                  avatarColors.glowLight,
                  "text-gray-800",
                  // Avatar - Dark mode
                  avatarColors.bgDark,
                  avatarColors.glowDark,
                  "dark:text-white/90",
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
            "flex items-center gap-2 text-xs",
            "text-muted-foreground", // Usa variable CSS que respeta el tema
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
            <span className="text-red-500 dark:text-red-400">Error al enviar</span>
          )}
        </div>
      </div>

      {/* Spacer para alinear mensajes del usuario */}
      {isUser && <div className="w-8 shrink-0" />}
    </div>
  );
});

export default MessageBubble;

