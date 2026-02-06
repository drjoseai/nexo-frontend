/**
 * Tests for Onboarding API Services
 * @module __tests__/lib/api/onboarding.test.ts
 */

import { apiClient } from '@/lib/api/client';
import {
  getOnboardingStatus,
  saveOnboardingProfile,
  updateOnboardingProfile,
  type OnboardingProfile,
  type OnboardingProfileResponse,
  type OnboardingStatusResponse,
} from '@/lib/api/onboarding';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Onboarding API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getOnboardingStatus
  // ============================================
  describe('getOnboardingStatus', () => {
    const mockStatusResponse: { data: OnboardingStatusResponse } = {
      data: {
        onboarding_completed: true,
        onboarding_completed_at: '2024-06-01T12:00:00Z',
        has_profile_data: true,
        profile_data: {
          name: 'Carlos',
          language: 'es',
          interests: ['music', 'technology'],
        },
      },
    };

    it('should fetch onboarding status successfully', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockStatusResponse);

      const result = await getOnboardingStatus();

      expect(result).toEqual(mockStatusResponse.data);
    });

    it('should call correct endpoint', async () => {
      mockedApiClient.get.mockResolvedValueOnce(mockStatusResponse);

      await getOnboardingStatus();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/v1/onboarding/status');
    });

    it('should handle incomplete onboarding status', async () => {
      mockedApiClient.get.mockResolvedValueOnce({
        data: {
          onboarding_completed: false,
          onboarding_completed_at: null,
          has_profile_data: false,
          profile_data: null,
        },
      });

      const result = await getOnboardingStatus();

      expect(result.onboarding_completed).toBe(false);
      expect(result.onboarding_completed_at).toBeNull();
      expect(result.has_profile_data).toBe(false);
      expect(result.profile_data).toBeNull();
    });

    it('should throw on failure', async () => {
      mockedApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(getOnboardingStatus()).rejects.toThrow('Unauthorized');
    });
  });

  // ============================================
  // saveOnboardingProfile
  // ============================================
  describe('saveOnboardingProfile', () => {
    const mockProfile: OnboardingProfile = {
      name: 'Carlos',
      preferred_language: 'es',
      location: 'México',
      profession: 'Ingeniero',
      age_range: '25-34',
      interests: ['music', 'technology'],
      communication_style: 'casual',
      looking_for: ['companionship', 'fun'],
    };

    const mockSaveResponse: { data: OnboardingProfileResponse } = {
      data: {
        success: true,
        message: 'Profile saved successfully',
        onboarding_completed: true,
        profile_summary: {
          name: 'Carlos',
          language: 'es',
          interests_count: 2,
          facts_count: 4,
        },
      },
    };

    it('should save onboarding profile successfully', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockSaveResponse);

      const result = await saveOnboardingProfile(mockProfile);

      expect(result).toEqual(mockSaveResponse.data);
    });

    it('should call correct endpoint with profile data', async () => {
      mockedApiClient.post.mockResolvedValueOnce(mockSaveResponse);

      await saveOnboardingProfile(mockProfile);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/onboarding/profile',
        mockProfile
      );
    });

    it('should handle minimal profile (name + language only)', async () => {
      const minimalProfile: OnboardingProfile = {
        name: 'Ana',
        preferred_language: 'en',
      };

      mockedApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Profile saved successfully',
          onboarding_completed: true,
          profile_summary: {
            name: 'Ana',
            language: 'en',
            interests_count: 0,
            facts_count: 1,
          },
        },
      });

      const result = await saveOnboardingProfile(minimalProfile);

      expect(result.success).toBe(true);
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        '/api/v1/onboarding/profile',
        minimalProfile
      );
    });

    it('should throw on save failure', async () => {
      mockedApiClient.post.mockRejectedValueOnce(new Error('Server error'));

      await expect(saveOnboardingProfile(mockProfile)).rejects.toThrow('Server error');
    });
  });

  // ============================================
  // updateOnboardingProfile
  // ============================================
  describe('updateOnboardingProfile', () => {
    const mockProfile: OnboardingProfile = {
      name: 'Carlos Updated',
      preferred_language: 'en',
      location: 'Miami',
      profession: 'Senior Engineer',
      age_range: '35-44',
      interests: ['music', 'technology', 'fitness'],
      communication_style: 'balanced',
      looking_for: ['advice', 'friendship'],
    };

    const mockUpdateResponse: { data: OnboardingProfileResponse } = {
      data: {
        success: true,
        message: 'Profile updated successfully',
        onboarding_completed: true,
        profile_summary: {
          name: 'Carlos Updated',
          language: 'en',
          interests_count: 3,
          facts_count: 5,
        },
      },
    };

    it('should update onboarding profile successfully', async () => {
      mockedApiClient.put.mockResolvedValueOnce(mockUpdateResponse);

      const result = await updateOnboardingProfile(mockProfile);

      expect(result).toEqual(mockUpdateResponse.data);
    });

    it('should call correct endpoint with PUT method', async () => {
      mockedApiClient.put.mockResolvedValueOnce(mockUpdateResponse);

      await updateOnboardingProfile(mockProfile);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/v1/onboarding/profile',
        mockProfile
      );
    });

    it('should throw on update failure', async () => {
      mockedApiClient.put.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(updateOnboardingProfile(mockProfile)).rejects.toThrow('Forbidden');
    });
  });
});
