// components/chat/FilePreview.tsx
// Preview de archivo antes de enviar en el chat de NEXO v2.0

"use client";

import { useMemo, useEffect } from "react";
import { X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// HELPERS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateName(name: string, maxLength: number = 25): string {
  if (name.length <= maxLength) return name;
  const ext = name.lastIndexOf(".");
  if (ext > 0) {
    const extension = name.slice(ext);
    const baseName = name.slice(0, ext);
    const availableLength = maxLength - extension.length - 3; // 3 for "..."
    if (availableLength > 0) {
      return baseName.slice(0, availableLength) + "..." + extension;
    }
  }
  return name.slice(0, maxLength - 3) + "...";
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext || "FILE";
}

// ============================================
// PROPS INTERFACE
// ============================================

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");

  const previewUrl = useMemo(() => {
    if (isImage) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, isImage]);

  // Cleanup objectURL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div
      className={cn(
        "mb-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      {/* Thumbnail or Icon */}
      {isImage && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={file.name}
          className="h-[60px] w-[60px] rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-white/10">
          <FileText className="h-6 w-6 text-white/60" />
        </div>
      )}

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/80 truncate">
          {truncateName(file.name)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-white/40">
            {formatFileSize(file.size)}
          </span>
          {!isImage && (
            <span className="inline-flex items-center rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/60">
              {getFileExtension(file.name)}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors duration-200"
        title="Quitar archivo"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Quitar archivo</span>
      </button>
    </div>
  );
}

export default FilePreview;
