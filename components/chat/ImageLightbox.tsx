// components/chat/ImageLightbox.tsx
// Lightbox fullscreen para ver imágenes en el chat de NEXO v2.0

"use client";

import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// ============================================
// PROPS INTERFACE
// ============================================

interface ImageLightboxProps {
  imageUrl: string;
  filename: string;
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function ImageLightbox({
  imageUrl,
  filename,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Add/remove event listeners and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Focus the close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Use portal to render outside normal DOM hierarchy
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors duration-200"
        aria-label="Cerrar"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={filename}
        className="max-h-[85vh] max-w-[90vw] object-contain animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Filename */}
      <p className="mt-4 text-sm text-white/60">{filename}</p>
    </div>,
    document.body
  );
}

export default ImageLightbox;
