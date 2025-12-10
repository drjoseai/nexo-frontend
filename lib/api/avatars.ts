/**
 * Avatar & Relationships API Service for NEXO v2.0
 *
 * Handles all avatar and relationship-related API calls.
 * Endpoints based on actual backend implementation.
 */

import { apiClient } from "./client";

// ============================================
// Types (aligned with backend schemas)
// ============================================

/** Avatar response from backend */
export interface AvatarResponse {
  id: string;
  name: string;
  age: string;
  role: string;
  description: string;
  personality_type: string | null;
  personality_traits: string[] | null;
  interests: string[] | null;
  background_story: string | null;
  voice_style: string | null;
  available_in_plans: string[];
  base_prompts: Record<string, string> | null;
  supports_romantic: boolean;
  supports_voice: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

/** Avatar list response from backend */
export interface AvatarListResponse {
  total: number;
  avatars: AvatarResponse[];
}

/** Relationship type info from backend */
export interface RelationshipTypeInfo {
  value: string;
  name: string;
  description: string;
  emoji: string;
  tone: string;
  requires_age_verification: boolean;
  available_plans: string[];
}

/** Relationship types response */
export interface RelationshipTypesResponse {
  types: RelationshipTypeInfo[];
  default: string;
}

/** Relationship info with an avatar */
export interface RelationshipInfo {
  current_type: string;
  current_type_info: {
    name: string;
    description: string;
    emoji: string;
    tone: string;
  };
  available_types: {
    value: string;
    name: string;
    available: boolean;
    reason?: string;
  }[];
  can_change_free: boolean;
  free_changes_remaining: number;
  relationship_depth: number;
  conversation_count: number;
}

/** All relationships summary */
export interface RelationshipsSummary {
  user_id: number;
  relationships: Record<
    string,
    {
      type: string;
      emoji: string;
      depth: number;
      conversations: number;
    }
  >;
  can_access_intimate: boolean;
  user_plan: string;
}

/** Set relationship request */
export interface SetRelationshipRequest {
  avatar_id: string;
  relationship_type: string;
}

/** Set relationship response */
export interface SetRelationshipResponse {
  success: boolean;
  message: string;
  transition_message?: string;
  current_type: string;
}

/** Age verification request */
export interface AgeVerificationRequest {
  birthdate: string; // Format: "YYYY-MM-DD"
  consent: boolean;
}

/** Age verification response */
export interface AgeVerificationResponse {
  success: boolean;
  message: string;
}

// ============================================
// Avatar Endpoints (Public - No Auth Required)
// ============================================

/**
 * Get all active avatars
 * @returns List of avatars with total count
 */
export async function getAvatars(): Promise<AvatarListResponse> {
  const response = await apiClient.get<AvatarListResponse>("/avatars");
  return response.data;
}

/**
 * Get single avatar by ID
 * @param avatarId - The avatar ID (lia, mia, allan)
 */
export async function getAvatar(avatarId: string): Promise<AvatarResponse> {
  const response = await apiClient.get<AvatarResponse>(`/avatars/${avatarId}`);
  return response.data;
}

// ============================================
// Relationship Endpoints (Auth Required)
// ============================================

/**
 * Get all available relationship types
 */
export async function getRelationshipTypes(): Promise<RelationshipTypesResponse> {
  const response = await apiClient.get<RelationshipTypesResponse>(
    "/relationships/types"
  );
  return response.data;
}

/**
 * Get relationship info with a specific avatar
 * @param avatarId - The avatar ID
 */
export async function getRelationshipInfo(
  avatarId: string
): Promise<RelationshipInfo> {
  const response = await apiClient.get<RelationshipInfo>(
    `/relationships/${avatarId}/info`
  );
  return response.data;
}

/**
 * Set/change relationship type with an avatar
 * @param avatarId - The avatar ID
 * @param relationshipType - The new relationship type
 */
export async function setRelationship(
  avatarId: string,
  relationshipType: string
): Promise<SetRelationshipResponse> {
  const response = await apiClient.post<SetRelationshipResponse>(
    "/relationships/set",
    {
      avatar_id: avatarId,
      relationship_type: relationshipType,
    }
  );
  return response.data;
}

/**
 * Get summary of all avatar relationships
 */
export async function getRelationshipsSummary(): Promise<RelationshipsSummary> {
  const response = await apiClient.get<RelationshipsSummary>(
    "/relationships/summary"
  );
  return response.data;
}

/**
 * Verify age for intimate relationship access
 * @param birthdate - Date of birth in YYYY-MM-DD format
 * @param consent - User consent confirmation
 */
export async function verifyAge(
  birthdate: string,
  consent: boolean
): Promise<AgeVerificationResponse> {
  const response = await apiClient.post<AgeVerificationResponse>(
    "/relationships/verify-age",
    {
      birthdate,
      consent,
    }
  );
  return response.data;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if user can access an avatar based on their plan
 */
export function canAccessAvatar(
  avatar: AvatarResponse,
  userPlan: string
): boolean {
  return avatar.available_in_plans.includes(userPlan);
}

/**
 * Check if romantic mode is available for an avatar
 */
export function canAccessRomantic(
  avatar: AvatarResponse,
  userPlan: string,
  ageVerified: boolean
): boolean {
  return (
    avatar.supports_romantic && userPlan === "premium" && ageVerified
  );
}

/**
 * Transform snake_case response to camelCase for frontend use
 */
export function transformAvatarResponse(avatar: AvatarResponse) {
  return {
    id: avatar.id,
    name: avatar.name,
    age: avatar.age,
    role: avatar.role,
    description: avatar.description,
    personalityType: avatar.personality_type,
    personalityTraits: avatar.personality_traits || [],
    interests: avatar.interests || [],
    backgroundStory: avatar.background_story,
    voiceStyle: avatar.voice_style,
    availableInPlans: avatar.available_in_plans,
    basePrompts: avatar.base_prompts,
    supportsRomantic: avatar.supports_romantic,
    supportsVoice: avatar.supports_voice,
    isActive: avatar.is_active,
    createdAt: avatar.created_at,
    updatedAt: avatar.updated_at,
  };
}

// ============================================
// Export grouped API object
// ============================================

const avatarsApi = {
  // Avatars
  getAvatars,
  getAvatar,
  // Relationships
  getRelationshipTypes,
  getRelationshipInfo,
  setRelationship,
  getRelationshipsSummary,
  verifyAge,
  // Helpers
  canAccessAvatar,
  canAccessRomantic,
  transformAvatarResponse,
};

export default avatarsApi;

