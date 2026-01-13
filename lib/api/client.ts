/**
 * Axios API Client for NEXO v2.0
 * @module lib/api/client
 * 
 * Features:
 * - Automatic token refresh on 401 errors
 * - httpOnly cookie-based authentication
 * - Request queuing during token refresh
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Get the API base URL from environment variables
 */
const getBaseURL = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return apiUrl;
};

// ============================================
// Token Refresh State Management
// ============================================

/** Flag to prevent multiple simultaneous refresh attempts */
let isRefreshing = false;

/** Queue of failed requests waiting for token refresh */
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh
 * @param error - Error to reject with (if refresh failed)
 */
const processQueue = (error: AxiosError | null = null): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// ============================================
// API Client Creation
// ============================================

/**
 * Create and configure the Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  /**
   * Request interceptor
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor with automatic token refresh
   */
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Check if this is a 401 error and we haven't already tried to refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // Don't try to refresh if we're already on the refresh or login endpoint
        const requestUrl = originalRequest.url || '';
        if (requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/login')) {
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('[API Client] Access token expired, attempting refresh...');
          
          await instance.post('/api/v1/auth/refresh', {}, {
            withCredentials: true,
          });
          
          console.log('[API Client] Token refresh successful, retrying original request');
          
          processQueue(null);
          
          return instance(originalRequest);
          
        } catch (refreshError) {
          console.error('[API Client] Token refresh failed:', refreshError);
          
          processQueue(refreshError as AxiosError);
          
          if (typeof window !== 'undefined') {
            console.log('[API Client] Redirecting to login...');
            
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
              sessionStorage.setItem('redirectAfterLogin', currentPath);
            }
            
            window.location.href = '/login?session_expired=true';
          }
          
          return Promise.reject(refreshError);
          
        } finally {
          isRefreshing = false;
        }
      }

      const errorMessage = error.response?.data || {
        message: error.message || 'An unexpected error occurred',
        status: error.response?.status,
      };
      
      return Promise.reject(errorMessage);
    }
  );

  return instance;
};

/**
 * Main API client instance
 */
export const apiClient = createApiClient();

/**
 * Helper function for GET requests
 * @param url - The endpoint URL
 * @param config - Optional Axios request config
 * @returns Promise with the response data
 */
export const get = async <T = unknown>(
  url: string,
  config?: Parameters<typeof apiClient.get>[1]
): Promise<T> => {
  const response = await apiClient.get<T>(url, config);
  return response.data;
};

/**
 * Helper function for POST requests
 * @param url - The endpoint URL
 * @param data - The request body data
 * @param config - Optional Axios request config
 * @returns Promise with the response data
 */
export const post = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: Parameters<typeof apiClient.post>[2]
): Promise<T> => {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
};

/**
 * Helper function for PUT requests
 * @param url - The endpoint URL
 * @param data - The request body data
 * @param config - Optional Axios request config
 * @returns Promise with the response data
 */
export const put = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: Parameters<typeof apiClient.put>[2]
): Promise<T> => {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
};

/**
 * Helper function for DELETE requests
 * @param url - The endpoint URL
 * @param config - Optional Axios request config
 * @returns Promise with the response data
 */
export const del = async <T = unknown>(
  url: string,
  config?: Parameters<typeof apiClient.delete>[1]
): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

// Export as 'delete' as well for convenience
export { del as delete };
