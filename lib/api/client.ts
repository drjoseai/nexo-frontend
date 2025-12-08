/**
 * Axios API Client for NEXO v2.0
 * @module lib/api/client
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Check if we're running in the browser (not SSR)
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Get the API base URL from environment variables
 */
const getBaseURL = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return apiUrl;
};

/**
 * Safely get token from localStorage
 * Returns null if running in SSR or token doesn't exist
 */
const getToken = (): string | null => {
  if (!isBrowser) return null;
  
  try {
    return localStorage.getItem('nexo_token');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

/**
 * Safely clear localStorage and redirect to login
 * Only works in browser context
 */
const clearAuthAndRedirect = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem('nexo_token');
    localStorage.removeItem('nexo_user');
    window.location.href = '/login';
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

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
  });

  /**
   * Request interceptor
   * Adds Authorization header with JWT token if available
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = getToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor
   * Handles 401 errors by clearing auth and redirecting to login
   */
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    (error: AxiosError) => {
      // Handle 401 Unauthorized errors
      if (error.response?.status === 401) {
        clearAuthAndRedirect();
      }
      
      // Return error.response.data if available, otherwise generic message
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
export const get = async <T = any>(
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
export const post = async <T = any>(
  url: string,
  data?: any,
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
export const put = async <T = any>(
  url: string,
  data?: any,
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
export const del = async <T = any>(
  url: string,
  config?: Parameters<typeof apiClient.delete>[1]
): Promise<T> => {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
};

// Export as 'delete' as well for convenience
export { del as delete };

