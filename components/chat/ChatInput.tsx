// components/chat/ChatInput.tsx
// Input para enviar mensajes en el chat de NEXO v2.0

"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmojiPickerButton } from "./EmojiPickerButton";
import { cn } from "@/lib/utils";

// ============================================
// PROPS INTERFACE
// ============================================

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Escribe un mensaje...",
  maxLength = 2000,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSend(trimmedMessage);
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift envía el mensaje
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handler para insertar emoji
  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const charactersRemaining = maxLength - message.length;
  const isNearLimit = charactersRemaining < 100;

  return (
    <div className={cn("relative", className)}>
      {/* Container con borde y fondo */}
      <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors focus-within:border-primary/50">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/40",
            "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "min-h-[24px] max-h-[150px]"
          )}
        />

        {/* Botón de emojis */}
        <EmojiPickerButton
          onEmojiSelect={handleEmojiSelect}
          disabled={disabled}
        />

        {/* Botón enviar */}
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-xl",
            "bg-primary hover:bg-primary/90 disabled:bg-white/10",
            "transition-all duration-200",
            message.trim() && !disabled && "shadow-lg shadow-primary/25"
          )}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Enviar mensaje</span>
        </Button>
      </div>

      {/* Contador de caracteres (solo si está cerca del límite) */}
      {isNearLimit && (
        <div
          className={cn(
            "absolute -top-6 right-0 text-xs",
            charactersRemaining < 20 ? "text-red-400" : "text-white/40"
          )}
        >
          {charactersRemaining} caracteres restantes
        </div>
      )}

      {/* Hint de atajos */}
      <div className="mt-2 text-center text-xs text-white/30">
        <span className="hidden sm:inline">
          Presiona <kbd className="rounded bg-white/10 px-1">Enter</kbd> para enviar,{" "}
          <kbd className="rounded bg-white/10 px-1">Shift + Enter</kbd> para nueva línea
        </span>
      </div>
    </div>
  );
}

export default ChatInput;

