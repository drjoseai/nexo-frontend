/**
 * IAP (In-App Purchase) API Services for NEXO v2.0
 * 
 * Communicates with backend IAP endpoints for subscription
 * status and Apple Sign In authentication.
 * 
 * @module lib/api/iap
 */

import { apiClient } from './client';
import type { User } from '@/types/auth';

/** IAP subscription status from backend */
export interface IAPStatus {
  has_active_subscription: boolean;
  plan: string | null;
  payment_provider: string | null;
  expires_at: string | null;
  is_trial: boolean;
  entitlements: string[];
  can_use_iap: boolean;
  message: string | null;
}

/** Apple Sign In response from backend */
interface AppleAuthBackendResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  is_new_user: boolean;
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    language: string;
    age_verified: boolean;
    onboarding_completed: boolean;
    auth_provider: string;
  };
}

/**
 * Transform backend Apple auth response to frontend User type
 */
function transformAppleUser(backendUser: AppleAuthBackendResponse['user']): User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    display_name: backendUser.name,
    plan: backendUser.plan as User['plan'],
    age_verified: backendUser.age_verified,
    tos_accepted: true,
    date_of_birth: null,
    preferred_language: (backendUser.language || 'es') as User['preferred_language'],
    created_at: new Date().toISOString(),
    trial_ends_at: null,
    onboarding_completed: backendUser.onboarding_completed ?? false,
  };
}

/**
 * Get IAP subscription status from backend.
 * Used by native apps to check if user has an active IAP subscription
 * and whether they can use IAP (vs Stripe already active).
 */
export async function getIAPStatus(): Promise<IAPStatus> {
  const response = await apiClient.get<IAPStatus>('/api/v1/iap/status');
  return response.data;
}

/**
 * Authenticate with Apple Sign In via backend.
 * Sends Apple credentials to backend, which validates with Apple
 * and returns NEXO JWT tokens + user data.
 * 
 * @param credentials - Apple Sign In credentials from native dialog
 * @returns Object with user data and whether it's a new user
 */
export async function appleSignInCallback(credentials: {
  identity_token: string;
  authorization_code: string;
  user?: string | null;
  email?: string | null;
  full_name?: { givenName?: string; familyName?: string } | null;
}): Promise<{ user: User; isNewUser: boolean }> {
  const response = await apiClient.post<AppleAuthBackendResponse>(
    '/api/v1/auth/apple/callback',
    {
      identity_token: credentials.identity_token,
      authorization_code: credentials.authorization_code,
      user: credentials.user || null,
      email: credentials.email || null,
      full_name: credentials.full_name
        ? {
            givenName: credentials.full_name.givenName || null,
            familyName: credentials.full_name.familyName || null,
          }
        : null,
    },
    {
      withCredentials: true,
    }
  );

  return {
    user: transformAppleUser(response.data.user),
    isNewUser: response.data.is_new_user,
  };
}
