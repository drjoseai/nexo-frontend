/**
 * Authentication API Services for NEXO v2.0
 * 
 * IMPORTANT: The backend uses OAuth2PasswordRequestForm for login,
 * which requires form-urlencoded data with 'username' field (not 'email').
 * 
 * @module lib/api/auth
 */

import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '@/types/auth';

// ============================================
// Backend Response Types (internal use)
// ============================================

/** Token response from backend (login/register) */
interface BackendTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/** User response from backend /auth/me and /auth/login */
interface BackendUserResponse {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  language: string;
  age_verified: boolean;
  trial_ends_at: string | null;
  created_at: string;
}

// ============================================
// Transform Functions
// ============================================

/**
 * Transform backend user response to frontend User type
 */
function transformUser(backendUser: BackendUserResponse): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    display_name: backendUser.name,
    plan: backendUser.plan as User['plan'],
    age_verified: backendUser.age_verified,
    preferred_language: (backendUser.language || 'es') as User['preferred_language'],
    created_at: backendUser.created_at,
    trial_ends_at: backendUser.trial_ends_at,
  };
}

// ============================================
// API Functions
// ============================================

/**
 * Authenticate a user with email and password
 * 
 * NOTE: Backend uses OAuth2PasswordRequestForm which requires:
 * - Content-Type: application/x-www-form-urlencoded
 * - Field name: 'username' (not 'email')
 * 
 * Backend now returns user object directly and handles tokens via httpOnly cookies.
 * This eliminates the race condition from the previous two-step login process.
 */
export const login = async (credentials: LoginRequest): Promise<User> => {
  // Create form data for OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // Backend expects 'username'
  formData.append('password', credentials.password);

  // Backend returns user object directly; tokens are handled via httpOnly cookies
  const response = await apiClient.post<BackendUserResponse>(
    '/api/v1/auth/login',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      withCredentials: true, // Ensure cookies are sent/received
    }
  );

  // Transform and return the user directly (no second API call needed)
  return transformUser(response.data);
};

/**
 * Register a new user account
 * 
 * After successful registration, we fetch user data from /auth/me
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  // Map frontend fields to backend fields
  const backendData = {
    email: data.email,
    password: data.password,
    name: data.display_name || null,
    language: data.preferred_language || 'es',
  };

  // Send registration request
  const tokenResponse = await apiClient.post<BackendTokenResponse>(
    '/api/v1/auth/register',
    backendData
  );

  // Store token temporarily to fetch user data
  const accessToken = tokenResponse.data.access_token;

  // Fetch user data using the new token
  const userResponse = await apiClient.get<BackendUserResponse>('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Return combined response matching frontend expectations
  return {
    user: transformUser(userResponse.data),
    message: 'Registration successful',
  };
};

/**
 * Get the currently authenticated user's profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<BackendUserResponse>('/api/v1/auth/me');
  return transformUser(response.data);
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/v1/auth/logout');
  } catch (error) {
    // Logout can fail silently - client-side cleanup is more important
    console.warn('Server logout failed, continuing with client-side cleanup', error);
  }
};

/**
 * Refresh the current access token
 * 
 * NOTE: Backend expects { refresh_token: "..." } in the body
 */
export const refreshToken = async (currentRefreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
}> => {
  const response = await apiClient.post<BackendTokenResponse>('/api/v1/auth/refresh', {
    refresh_token: currentRefreshToken,
  });

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

/**
 * Request password reset email
 */
export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/api/v1/auth/forgot-password', null, {
    params: { email },
  });
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/api/v1/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};

/**
 * Verify user's age (18+) for romantic mode access
 */
export const verifyAge = async (): Promise<{
  success: boolean;
  message: string;
  verified_at: string | null;
}> => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    verified_at: string | null;
  }>('/api/v1/auth/verify-age');
  
  return response.data;
};
