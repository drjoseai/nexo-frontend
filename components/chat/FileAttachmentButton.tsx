// components/chat/FileAttachmentButton.tsx
// Botón para adjuntar archivos al chat de NEXO v2.0

"use client";

import { useRef } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// CONSTANTS
// ============================================

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,text/plain,application/pdf";

// ============================================
// PROPS INTERFACE
// ============================================

interface FileAttachmentButtonProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  uploading?: boolean;
  remaining?: number;
}

// ============================================
// COMPONENT
// ============================================

export function FileAttachmentButton({
  onFileSelected,
  disabled = false,
  uploading = false,
  remaining,
}: FileAttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const isLimitReached = remaining === 0;
  const isDisabled = disabled || uploading || isLimitReached;

  // Determine tooltip text
  const getTooltip = (): string => {
    if (uploading) return "Subiendo archivo...";
    if (isLimitReached) return "Límite diario alcanzado";
    if (remaining !== undefined) return `Adjuntar archivo (${remaining} restantes hoy)`;
    return "Adjuntar archivo";
  };

  const handleClick = () => {
    if (!isDisabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    // Reset input to allow re-selecting the same file
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        title={getTooltip()}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200",
          isDisabled
            ? "cursor-not-allowed text-white/20"
            : "cursor-pointer text-white/40 hover:text-white/60 hover:bg-white/10"
        )}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
        <span className="sr-only">{getTooltip()}</span>
      </button>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </>
  );
}

export default FileAttachmentButton;
