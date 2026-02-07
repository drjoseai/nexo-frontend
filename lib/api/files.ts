// lib/api/files.ts
// API service para file upload de NEXO v2.0
// Endpoints: POST /files/upload, GET /files/limits, POST /files/refresh-url

import { apiClient } from "./client";

// ============================================
// TYPES
// ============================================

export interface FileUploadResponse {
  file_url: string;
  filename: string;
  storage_path: string;
  file_type: "image" | "text";
  file_size: number;
  mime_type: string;
}

export interface UploadLimitsResponse {
  plan: string;
  daily_limit: number;
  used_today: number;
  remaining: number;
  allowed_types: string[];
  max_image_size_mb: number;
  max_text_size_mb: number;
}

export interface RefreshUrlResponse {
  file_url: string;
  expires_in: number;
}

// ============================================
// CLIENT-SIDE VALIDATION
// ============================================

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_TEXT_TYPES = ["text/plain", "application/pdf"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5MB
const MAX_TEXT_SIZE = 10 * 1024;          // 10KB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType?: "image" | "text";
}

export function validateFile(file: File): ValidationResult {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isText = ALLOWED_TEXT_TYPES.includes(file.type);

  if (!isImage && !isText) {
    return { valid: false, error: "Tipo de archivo no soportado. Usa imágenes (JPG, PNG, WebP, GIF) o texto (TXT, PDF)." };
  }

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: "La imagen no puede exceder 5MB." };
  }

  if (isText && file.size > MAX_TEXT_SIZE) {
    return { valid: false, error: "El archivo de texto no puede exceder 10KB." };
  }

  return { valid: true, fileType: isImage ? "image" : "text" };
}

// ============================================
// API CALLS
// ============================================

/**
 * Sube un archivo a Cloudflare R2 via el backend
 * Endpoint: POST /api/v1/files/upload
 * NOTA: Usa FormData, NO JSON. Se debe overridear Content-Type.
 */
async function uploadFile(file: File, avatarId: string): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("avatar_id", avatarId);

  const response = await apiClient.post<FileUploadResponse>(
    "/api/v1/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}

/**
 * Obtiene los límites de upload del usuario actual
 * Endpoint: GET /api/v1/files/limits
 */
async function getUploadLimits(): Promise<UploadLimitsResponse> {
  const response = await apiClient.get<UploadLimitsResponse>("/api/v1/files/limits");
  return response.data;
}

/**
 * Regenera una URL firmada expirada
 * Endpoint: POST /api/v1/files/refresh-url
 */
async function refreshFileUrl(storagePath: string): Promise<RefreshUrlResponse> {
  const response = await apiClient.post<RefreshUrlResponse>(
    "/api/v1/files/refresh-url",
    { storage_path: storagePath }
  );
  return response.data;
}

// ============================================
// FILE API OBJECT
// ============================================

export const fileApi = {
  uploadFile,
  getUploadLimits,
  refreshFileUrl,
  validateFile,
};

export default fileApi;
