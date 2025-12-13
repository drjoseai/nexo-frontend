/**
 * Toast Notification Service for NEXO v2.0
 * 
 * Centralized service for displaying user notifications.
 * Wraps Sonner toast library with consistent styling and behavior.
 * 
 * @module lib/services/toast-service
 */

import { toast as sonnerToast } from 'sonner';

/**
 * Toast configuration options
 */
export interface ToastOptions {
  /** Duration in milliseconds (default: 4000) */
  duration?: number;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional description text */
  description?: string;
  /** Custom ID to prevent duplicates */
  id?: string;
}

/**
 * Toast types for different notification contexts
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

/**
 * Default durations by toast type (in ms)
 */
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 4000,
  loading: Infinity,
};

/**
 * Display a success notification
 * @param message - The message to display
 * @param options - Optional configuration
 */
export function success(message: string, options?: ToastOptions): string | number {
  return sonnerToast.success(message, {
    duration: options?.duration ?? DEFAULT_DURATIONS.success,
    description: options?.description,
    id: options?.id,
    action: options?.action,
  });
}

/**
 * Display an error notification
 * @param message - The error message to display
 * @param options - Optional configuration
 */
export function error(message: string, options?: ToastOptions): string | number {
  return sonnerToast.error(message, {
    duration: options?.duration ?? DEFAULT_DURATIONS.error,
    description: options?.description,
    id: options?.id,
    action: options?.action,
  });
}

/**
 * Display a warning notification
 * @param message - The warning message to display
 * @param options - Optional configuration
 */
export function warning(message: string, options?: ToastOptions): string | number {
  return sonnerToast.warning(message, {
    duration: options?.duration ?? DEFAULT_DURATIONS.warning,
    description: options?.description,
    id: options?.id,
    action: options?.action,
  });
}

/**
 * Display an info notification
 * @param message - The info message to display
 * @param options - Optional configuration
 */
export function info(message: string, options?: ToastOptions): string | number {
  return sonnerToast.info(message, {
    duration: options?.duration ?? DEFAULT_DURATIONS.info,
    description: options?.description,
    id: options?.id,
    action: options?.action,
  });
}

/**
 * Display a loading notification
 * Returns a toast ID that can be used to dismiss or update
 * @param message - The loading message to display
 * @param options - Optional configuration
 */
export function loading(message: string, options?: ToastOptions): string | number {
  return sonnerToast.loading(message, {
    duration: options?.duration ?? DEFAULT_DURATIONS.loading,
    description: options?.description,
    id: options?.id,
  });
}

/**
 * Dismiss a specific toast by ID or all toasts
 * @param toastId - Optional toast ID to dismiss specific toast
 */
export function dismiss(toastId?: string | number): void {
  if (toastId !== undefined) {
    sonnerToast.dismiss(toastId);
  } else {
    sonnerToast.dismiss();
  }
}

/**
 * Show a promise-based toast that updates based on promise state
 * @param promise - The promise to track
 * @param messages - Messages for each state
 */
export function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  }
): Promise<T> {
  sonnerToast.promise(promise, messages);
  return promise;
}

/**
 * Parse API error and return user-friendly message
 * @param error - The error object from API
 * @returns User-friendly error message
 */
export function parseApiError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    
    // Extract message from various error formats
    let message: string | undefined;
    
    // Format 1: Axios error { response: { data: { message: '...' } } }
    if (err.response?.data?.message) {
      message = err.response.data.message;
    }
    // Format 2: Axios error { response: { data: { detail: '...' } } } (FastAPI)
    else if (err.response?.data?.detail) {
      message = err.response.data.detail;
    }
    // Format 3: Direct message { message: '...' }
    else if (err.message && typeof err.message === 'string') {
      message = err.message;
    }
    // Format 4: Direct detail { detail: '...' } (FastAPI)
    else if (err.detail && typeof err.detail === 'string') {
      message = err.detail;
    }
    
    if (message) {
      // Translate common backend errors to Spanish
      if (message.includes('Invalid credentials') || message.includes('Credenciales inválidas')) {
        return 'Credenciales inválidas. Verifica tu email y contraseña.';
      }
      if (message.includes('User already exists') || message.includes('email ya está registrado')) {
        return 'Este email ya está registrado.';
      }
      if (message.includes('Token expired')) {
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      }
      if (message.includes('Network Error')) {
        return 'Error de conexión. Verifica tu internet.';
      }
      
      return message;
    }
  }
  
  return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
}

/**
 * Display an API error with automatic parsing
 * @param err - The error from API call
 * @param fallbackMessage - Fallback message if parsing fails
 */
export function apiError(err: unknown, fallbackMessage?: string): string | number {
  const message = parseApiError(err) || fallbackMessage || 'Error inesperado';
  return error(message);
}

/**
 * Toast service object for named imports
 */
export const toast = {
  success,
  error,
  warning,
  info,
  loading,
  dismiss,
  promise,
  apiError,
  parseApiError,
};

export default toast;

