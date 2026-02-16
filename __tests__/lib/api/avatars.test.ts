/**
 * Tests for Avatars & Relationships API Service
 * NEXO v2.0 - Day 10
 * 
 * @module __tests__/lib/api/avatars.test
 */

import {
  getAvatars,
  getAvatar,
  getRelationshipTypes,
  getRelationshipInfo,
  setRelationship,
  getRelationshipsSummary,
  verifyAge,
  canAccessAvatar,
  canAccessRomantic,
  transformAvatarResponse,
  type AvatarResponse,
} from '@/lib/api/avatars';
import { apiClient } from '@/lib/api/client';

// Mock the API client
jest.mock('@/lib/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock avatar data
const mockAvatar: AvatarResponse = {
  id: 'lia',
  name: 'Lía',
  age: '22',
  role: 'Empática creativa',
  description: 'Tu compañera creativa y empática',
  personality_type: 'INFP',
  personality_traits: ['empática', 'creativa', 'sensible'],
  interests: ['arte', 'música', 'literatura'],
  background_story: 'Una joven artista...',
  voice_style: 'cálida y suave',
  available_in_plans: ['free', 'plus', 'premium'],
  base_prompts: { greeting: 'Hola!' },
  supports_romantic: true,
  supports_voice: false,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-12-01T00:00:00Z',
};

describe('Avatars API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Avatar Endpoints
  // ============================================

  describe('getAvatars', () => {
    it('should fetch all avatars', async () => {
      const mockResponse = {
        data: {
          total: 3,
          avatars: [mockAvatar],
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getAvatars();

      expect(mockApiClient.get).toHaveBeenCalledWith('/avatars');
      expect(result.total).toBe(3);
      expect(result.avatars).toHaveLength(1);
    });

    it('should handle empty avatar list', async () => {
      const mockResponse = {
        data: { total: 0, avatars: [] },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getAvatars();

      expect(result.avatars).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Server error'));

      await expect(getAvatars()).rejects.toThrow('Server error');
    });
  });

  describe('getAvatar', () => {
    it('should fetch single avatar by ID', async () => {
      const mockResponse = { data: mockAvatar };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getAvatar('lia');

      expect(mockApiClient.get).toHaveBeenCalledWith('/avatars/lia');
      expect(result.id).toBe('lia');
      expect(result.name).toBe('Lía');
    });

    it('should handle different avatar IDs', async () => {
      const miaAvatar = { ...mockAvatar, id: 'mia', name: 'Mía' };
      mockApiClient.get.mockResolvedValueOnce({ data: miaAvatar });

      const result = await getAvatar('mia');

      expect(mockApiClient.get).toHaveBeenCalledWith('/avatars/mia');
      expect(result.id).toBe('mia');
    });

    it('should handle not found error', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Avatar not found'));

      await expect(getAvatar('unknown')).rejects.toThrow('Avatar not found');
    });
  });

  // ============================================
  // Relationship Endpoints
  // ============================================

  describe('getRelationshipTypes', () => {
    it('should fetch all relationship types', async () => {
      const mockResponse = {
        data: {
          types: [
            { value: 'assistant', name: 'Aliado', description: 'Tu guía confiable y profesional', emoji: '🤝', tone: 'formal', requires_age_verification: false, available_plans: ['free', 'plus', 'premium'] },
            { value: 'friend', name: 'Confidente', description: 'Alguien que te escucha de verdad', emoji: '💛', tone: 'casual', requires_age_verification: false, available_plans: ['free', 'plus', 'premium'] },
          ],
          default: 'assistant',
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getRelationshipTypes();

      expect(mockApiClient.get).toHaveBeenCalledWith('/relationships/types');
      expect(result.types).toHaveLength(2);
      expect(result.default).toBe('assistant');
    });
  });

  describe('getRelationshipInfo', () => {
    it('should fetch relationship info for avatar', async () => {
      const mockResponse = {
        data: {
          current_type: 'friend',
          current_type_info: { name: 'Confidente', description: 'Alguien que te escucha de verdad', emoji: '💛', tone: 'casual' },
          available_types: [{ value: 'friend', name: 'Confidente', available: true }],
          can_change_free: true,
          free_changes_remaining: 3,
          relationship_depth: 25,
          conversation_count: 10,
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getRelationshipInfo('lia');

      expect(mockApiClient.get).toHaveBeenCalledWith('/relationships/lia/info');
      expect(result.current_type).toBe('friend');
      expect(result.relationship_depth).toBe(25);
    });
  });

  describe('setRelationship', () => {
    it('should set relationship type', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Relationship updated',
          transition_message: 'Ahora somos amigos!',
          current_type: 'friend',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await setRelationship('lia', 'friend');

      expect(mockApiClient.post).toHaveBeenCalledWith('/relationships/set', {
        avatar_id: 'lia',
        relationship_type: 'friend',
      });
      expect(result.success).toBe(true);
      expect(result.current_type).toBe('friend');
    });

    it('should handle relationship change failure', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Plan upgrade required',
          current_type: 'assistant',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await setRelationship('lia', 'romantic');

      expect(result.success).toBe(false);
    });
  });

  describe('getRelationshipsSummary', () => {
    it('should fetch all relationships summary', async () => {
      const mockResponse = {
        data: {
          user_id: 1,
          relationships: {
            lia: { type: 'friend', emoji: '😊', depth: 25, conversations: 10 },
            mia: { type: 'assistant', emoji: '🤖', depth: 5, conversations: 2 },
          },
          can_access_intimate: false,
          user_plan: 'plus',
        },
      };
      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await getRelationshipsSummary();

      expect(mockApiClient.get).toHaveBeenCalledWith('/relationships/summary');
      expect(result.user_plan).toBe('plus');
      expect(result.relationships.lia.type).toBe('friend');
    });
  });

  describe('verifyAge', () => {
    it('should verify age successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Age verified successfully',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await verifyAge('1990-05-15', true);

      expect(mockApiClient.post).toHaveBeenCalledWith('/relationships/verify-age', {
        birthdate: '1990-05-15',
        consent: true,
      });
      expect(result.success).toBe(true);
    });

    it('should reject underage users', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Must be 18 or older',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await verifyAge('2010-01-01', true);

      expect(result.success).toBe(false);
    });

    it('should reject without consent', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Consent required',
        },
      };
      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await verifyAge('1990-05-15', false);

      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // Helper Functions (Pure - No Mocks Needed)
  // ============================================

  describe('canAccessAvatar', () => {
    it('should return true when plan is in available_in_plans', () => {
      expect(canAccessAvatar(mockAvatar, 'free')).toBe(true);
      expect(canAccessAvatar(mockAvatar, 'plus')).toBe(true);
      expect(canAccessAvatar(mockAvatar, 'premium')).toBe(true);
    });

    it('should return false when plan is not in available_in_plans', () => {
      const restrictedAvatar = { ...mockAvatar, available_in_plans: ['premium'] };
      expect(canAccessAvatar(restrictedAvatar, 'free')).toBe(false);
      expect(canAccessAvatar(restrictedAvatar, 'plus')).toBe(false);
    });
  });

  describe('canAccessRomantic', () => {
    it('should return true when all conditions met', () => {
      expect(canAccessRomantic(mockAvatar, 'premium', true)).toBe(true);
    });

    it('should return false when avatar does not support romantic', () => {
      const noRomanticAvatar = { ...mockAvatar, supports_romantic: false };
      expect(canAccessRomantic(noRomanticAvatar, 'premium', true)).toBe(false);
    });

    it('should return false when plan is not premium', () => {
      expect(canAccessRomantic(mockAvatar, 'plus', true)).toBe(false);
      expect(canAccessRomantic(mockAvatar, 'free', true)).toBe(false);
    });

    it('should return false when age not verified', () => {
      expect(canAccessRomantic(mockAvatar, 'premium', false)).toBe(false);
    });
  });

  describe('transformAvatarResponse', () => {
    it('should transform snake_case to camelCase', () => {
      const transformed = transformAvatarResponse(mockAvatar);

      expect(transformed.personalityType).toBe('INFP');
      expect(transformed.personalityTraits).toEqual(['empática', 'creativa', 'sensible']);
      expect(transformed.backgroundStory).toBe('Una joven artista...');
      expect(transformed.voiceStyle).toBe('cálida y suave');
      expect(transformed.availableInPlans).toEqual(['free', 'plus', 'premium']);
      expect(transformed.supportsRomantic).toBe(true);
      expect(transformed.supportsVoice).toBe(false);
      expect(transformed.isActive).toBe(true);
    });

    it('should handle null values', () => {
      const nullAvatar = {
        ...mockAvatar,
        personality_type: null,
        personality_traits: null,
        interests: null,
        background_story: null,
      };
      const transformed = transformAvatarResponse(nullAvatar);

      expect(transformed.personalityType).toBeNull();
      expect(transformed.personalityTraits).toEqual([]);
      expect(transformed.interests).toEqual([]);
      expect(transformed.backgroundStory).toBeNull();
    });

    it('should preserve basic fields', () => {
      const transformed = transformAvatarResponse(mockAvatar);

      expect(transformed.id).toBe('lia');
      expect(transformed.name).toBe('Lía');
      expect(transformed.age).toBe('22');
      expect(transformed.role).toBe('Empática creativa');
    });
  });
});

