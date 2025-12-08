/**
 * Authentication API Services for NEXO v2.0
 * @module lib/api/auth
 */

import { post, get } from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/auth';

/**
 * Authenticate a user with email and password
 * 
 * @param credentials - User login credentials (email and password)
 * @returns Promise resolving to LoginResponse containing access token and user data
 * @throws {Error} When authentication fails or server returns an error
 * 
 * @example
 * ```typescript
 * const response = await login({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 * console.log(response.access_token, response.user);
 * ```
 */
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  return await post<LoginResponse>('/auth/login', credentials);
};

/**
 * Register a new user account
 * 
 * @param data - User registration data including email, password, and optional fields
 * @returns Promise resolving to RegisterResponse with created user and success message
 * @throws {Error} When registration fails (e.g., email already exists)
 * 
 * @example
 * ```typescript
 * const response = await register({
 *   email: 'newuser@example.com',
 *   password: 'securePassword123',
 *   display_name: 'John Doe',
 *   preferred_language: 'es'
 * });
 * console.log(response.message, response.user);
 * ```
 */
export const register = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  return await post<RegisterResponse>('/auth/register', data);
};

/**
 * Get the currently authenticated user's profile
 * 
 * Requires a valid JWT token in localStorage.
 * The token is automatically included by the API client interceptor.
 * 
 * @returns Promise resolving to the authenticated User object
 * @throws {Error} When user is not authenticated or token is invalid (401)
 * 
 * @example
 * ```typescript
 * try {
 *   const user = await getCurrentUser();
 *   console.log(user.email, user.plan);
 * } catch (error) {
 *   // User is not authenticated or token expired
 *   console.error('Not authenticated');
 * }
 * ```
 */
export const getCurrentUser = async (): Promise<User> => {
  return await get<User>('/auth/me');
};

/**
 * Log out the current user
 * 
 * Optionally sends a logout request to the server to invalidate the token.
 * This is primarily a client-side operation that clears local storage.
 * The actual cleanup is handled by the auth store.
 * 
 * @returns Promise that resolves when logout is complete
 * 
 * @example
 * ```typescript
 * await logout();
 * // User is now logged out, token cleared from localStorage
 * ```
 */
export const logout = async (): Promise<void> => {
  try {
    // Optional: Send logout request to server to invalidate token
    await post<void>('/auth/logout');
  } catch (error) {
    // Logout can fail silently - client-side cleanup is more important
    console.warn('Server logout failed, continuing with client-side cleanup', error);
  }
};

/**
 * Refresh the current access token
 * 
 * Uses the existing token to obtain a new one, extending the user's session.
 * The client should store the new token and use it for subsequent requests.
 * 
 * @returns Promise resolving to an object containing the new access_token
 * @throws {Error} When token refresh fails (e.g., refresh token expired)
 * 
 * @example
 * ```typescript
 * try {
 *   const { access_token } = await refreshToken();
 *   localStorage.setItem('nexo_token', access_token);
 * } catch (error) {
 *   // Refresh failed, user needs to log in again
 *   console.error('Session expired');
 * }
 * ```
 */
export const refreshToken = async (): Promise<{ access_token: string }> => {
  return await post<{ access_token: string }>('/auth/refresh');
};

