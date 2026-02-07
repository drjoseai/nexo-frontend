// components/chat/MessageAttachment.tsx
// Attachment display dentro de burbujas de mensaje en NEXO v2.0

"use client";

import { useState, useCallback } from "react";
import { FileText, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileApi } from "@/lib/api/files";
import { ImageLightbox } from "./ImageLightbox";

// ============================================
// HELPERS
// ============================================

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext || "FILE";
}

function truncateName(name: string, maxLength: number = 30): string {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf(".");
  if (ext > 0) {
    const extension = name.slice(ext);
    const baseName = name.slice(0, ext);
    const availableLength = maxLength - extension.length - 3;
    if (availableLength > 0) {
      return baseName.slice(0, availableLength) + "..." + extension;
    }
  }
  return name.slice(0, maxLength - 3) + "...";
}

// ============================================
// PROPS INTERFACE
// ============================================

interface MessageAttachmentProps {
  attachmentUrl: string;
  attachmentType: "image" | "text";
  attachmentFilename: string;
  storagePath?: string;
}

// ============================================
// COMPONENT
// ============================================

export function MessageAttachment({
  attachmentUrl,
  attachmentType,
  attachmentFilename,
  storagePath,
}: MessageAttachmentProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  const currentUrl = refreshedUrl || attachmentUrl;

  const handleImageError = useCallback(async () => {
    // Try to refresh the URL once if we have a storagePath
    if (!hasTriedRefresh && storagePath) {
      setHasTriedRefresh(true);
      try {
        const result = await fileApi.refreshFileUrl(storagePath);
        setRefreshedUrl(result.signed_url);
        setImageError(false);
        return;
      } catch {
        // Refresh failed, show error state
      }
    }
    setImageError(true);
  }, [hasTriedRefresh, storagePath]);

  // ============================================
  // IMAGE ATTACHMENT
  // ============================================
  if (attachmentType === "image") {
    return (
      <>
        <div className="mb-1.5">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="h-48 w-full max-w-[280px] sm:max-w-[400px] animate-pulse rounded-lg bg-white/10" />
          )}

          {/* Error state */}
          {imageError && (
            <div className="flex h-32 w-full max-w-[280px] sm:max-w-[400px] items-center justify-center rounded-lg bg-white/5 border border-white/10">
              <div className="flex flex-col items-center gap-2 text-white/40">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs">No se pudo cargar la imagen</span>
              </div>
            </div>
          )}

          {/* Actual image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt={attachmentFilename}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            onClick={() => setLightboxOpen(true)}
            className={cn(
              "max-w-[280px] sm:max-w-[400px] rounded-lg object-cover cursor-pointer",
              "hover:opacity-90 transition-opacity duration-200",
              !imageLoaded && "hidden",
              imageError && "hidden"
            )}
          />
        </div>

        {/* Lightbox */}
        <ImageLightbox
          imageUrl={currentUrl}
          filename={attachmentFilename}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // ============================================
  // TEXT/PDF ATTACHMENT
  // ============================================
  return (
    <div className="mb-1.5 flex items-center gap-2.5 rounded-lg bg-white/5 border border-white/10 p-2.5 max-w-[280px] sm:max-w-[400px]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <FileText className="h-5 w-5 text-white/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 truncate">
          {truncateName(attachmentFilename)}
        </p>
      </div>
      <span className="inline-flex items-center rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/50 shrink-0">
        {getFileExtension(attachmentFilename)}
      </span>
    </div>
  );
}

export default MessageAttachment;
