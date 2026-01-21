// components/chat/EmojiPickerButton.tsx
// Botón con picker de emojis para el input de chat

"use client";

import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";
import dynamic from "next/dynamic";
import { Theme } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import { Button } from "@/components/ui/button";

// Dynamic import para evitar SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="w-[320px] h-[400px] bg-background animate-pulse rounded-lg" />
  ),
});

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPickerButton({
  onEmojiSelect,
  disabled = false,
}: EmojiPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Cerrar picker al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="h-9 w-9 text-white/40 hover:text-white/80 hover:bg-white/10"
      >
        <Smile className="h-5 w-5" />
        <span className="sr-only">Emojis</span>
      </Button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.DARK}
            width={320}
            height={400}
            searchPlaceholder="Buscar emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}

