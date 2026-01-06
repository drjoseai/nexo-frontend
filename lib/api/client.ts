/**
 * Axios API Client for NEXO v2.0
 * @module lib/api/client
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Get the API base URL from environment variables
 */
const getBaseURL = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return apiUrl;
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
    withCredentials: true, // Enable sending httpOnly cookies with requests
  });

  /**
   * Request interceptor
   * No manual token handling needed - cookies are sent automatically with withCredentials: true
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // Cookies (including httpOnly auth cookies) are sent automatically
      // No need to manually add Authorization header
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor
   * Handles errors and passes them to calling code
   * 401 errors are handled by the auth store
   */
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      return response;
    },
    (error: AxiosError) => {
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

