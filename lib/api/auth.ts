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

/** User response from backend /auth/me */
interface BackendUserResponse {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  language: string;
  age_verified: boolean;
  trial_ends_at: string | null;
  messages_remaining: number;
  profile_data: Record<string, unknown>;
  preferences: Record<string, unknown>;
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
    created_at: new Date().toISOString(), // Backend doesn't return this
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
 * After successful login, we fetch user data from /auth/me
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  // Create form data for OAuth2PasswordRequestForm
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // Backend expects 'username'
  formData.append('password', credentials.password);

  // Send login request with form-urlencoded content type
  const tokenResponse = await apiClient.post<BackendTokenResponse>(
    '/auth/login',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  // Store token temporarily to fetch user data
  const accessToken = tokenResponse.data.access_token;

  // Fetch user data using the new token
  const userResponse = await apiClient.get<BackendUserResponse>('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Return combined response matching frontend expectations
  return {
    access_token: accessToken,
    refresh_token: tokenResponse.data.refresh_token,
    expires_in: tokenResponse.data.expires_in || 3600,
    token_type: tokenResponse.data.token_type,
    user: transformUser(userResponse.data),
  };
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
    '/auth/register',
    backendData
  );

  // Store token temporarily to fetch user data
  const accessToken = tokenResponse.data.access_token;

  // Fetch user data using the new token
  const userResponse = await apiClient.get<BackendUserResponse>('/auth/me', {
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
  const response = await apiClient.get<BackendUserResponse>('/auth/me');
  return transformUser(response.data);
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
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
  const response = await apiClient.post<BackendTokenResponse>('/auth/refresh', {
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
  const response = await apiClient.post<{ message: string }>('/auth/forgot-password', null, {
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
  const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
    token,
    new_password: newPassword,
  });
  return response.data;
};
