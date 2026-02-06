/**
 * Onboarding API Services for NEXO v2.0
 * @module lib/api/onboarding
 */

import { apiClient } from './client';

// ============================================
// Types
// ============================================

export interface OnboardingProfile {
  name: string;
  preferred_language: 'es' | 'en';
  location?: string;
  profession?: string;
  age_range?: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  interests?: string[];
  communication_style?: 'casual' | 'balanced' | 'formal';
  looking_for?: Array<'companionship' | 'advice' | 'fun' | 'emotional_support' | 'romance' | 'friendship'>;
}

export interface OnboardingProfileResponse {
  success: boolean;
  message: string;
  onboarding_completed: boolean;
  profile_summary: {
    name: string;
    language: string;
    interests_count: number;
    facts_count: number;
  };
}

export interface OnboardingStatusResponse {
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  has_profile_data: boolean;
  profile_data: Record<string, unknown> | null;
}

// ============================================
// API Functions
// ============================================

/**
 * Get onboarding status for current user
 */
export const getOnboardingStatus = async (): Promise<OnboardingStatusResponse> => {
  const response = await apiClient.get<OnboardingStatusResponse>('/api/v1/onboarding/status');
  return response.data;
};

/**
 * Save onboarding profile
 */
export const saveOnboardingProfile = async (
  profile: OnboardingProfile
): Promise<OnboardingProfileResponse> => {
  const response = await apiClient.post<OnboardingProfileResponse>(
    '/api/v1/onboarding/profile',
    profile
  );
  return response.data;
};

/**
 * Update onboarding profile
 */
export const updateOnboardingProfile = async (
  profile: OnboardingProfile
): Promise<OnboardingProfileResponse> => {
  const response = await apiClient.put<OnboardingProfileResponse>(
    '/api/v1/onboarding/profile',
    profile
  );
  return response.data;
};
