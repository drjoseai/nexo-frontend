/**
 * Avatar Types for NEXO v2.0
 * 
 * Defines all TypeScript interfaces for avatar-related data structures.
 * Aligned with backend models from app/models/avatar.py
 */

// ============================================
// Core Avatar Types
// ============================================

/** Avatar identifier - matches backend IDs */
export type AvatarId = "lia" | "mia" | "allan";

/** Relationship levels available in NEXO */
export type RelationshipType = "assistant" | "friend" | "confidant" | "romantic";

/** Subscription plans */
export type PlanType = "trial" | "free" | "plus" | "premium";

/** Avatar status in user's context */
export type AvatarStatus = "available" | "locked" | "active";

// ============================================
// Avatar Data Structures
// ============================================

/** Base avatar information - matches backend Avatar model */
export interface Avatar {
  id: AvatarId;
  name: string;
  age: string;
  role: string;
  personalityType?: string;
  description: string;
  personalityTraits: string[];
  voiceStyle?: string;
  interests?: string[];
  backgroundStory?: string;
  availableInPlans: PlanType[];
  supportsRomantic: boolean;
  supportsVoice?: boolean;
  basePrompts?: Record<string, string>;
  isActive: boolean;
}

/** Avatar with user-specific relationship data */
export interface UserAvatar extends Avatar {
  status: AvatarStatus;
  currentRelationship: RelationshipType;
  availableRelationships: RelationshipType[];
  relationshipScore: number; // 0-100
  lastInteraction: string | null; // ISO date string
  messageCount: number;
  isUnlocked: boolean;
}

/** Minimal avatar info for cards/lists */
export interface AvatarSummary {
  id: AvatarId;
  name: string;
  age: string;
  role: string;
  description: string;
  accentColor: AvatarId; // Maps to CSS variables
  status: AvatarStatus;
  currentRelationship: RelationshipType;
  isUnlocked: boolean;
  supportsRomantic: boolean;
}

// ============================================
// API Response Types
// ============================================

/** Response when fetching all avatars */
export interface AvatarsResponse {
  avatars: UserAvatar[];
  activeAvatarId: AvatarId | null;
}

/** Response when fetching single avatar */
export interface AvatarDetailResponse {
  avatar: UserAvatar;
  conversationPreview: ConversationPreview | null;
}

/** Brief conversation preview for avatar cards */
export interface ConversationPreview {
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

// ============================================
// Relationship Types
// ============================================

/** Relationship level details */
export interface RelationshipLevel {
  type: RelationshipType;
  name: string;
  description: string;
  requiredPlan: PlanType;
  minScore: number;
  icon: string; // Lucide icon name
}

/** Relationship progress data */
export interface RelationshipProgress {
  currentLevel: RelationshipType;
  currentScore: number;
  nextLevel: RelationshipType | null;
  scoreToNextLevel: number | null;
}

// ============================================
// Avatar Selection & Interaction
// ============================================

/** Request to change relationship type */
export interface ChangeRelationshipRequest {
  avatarId: AvatarId;
  newRelationship: RelationshipType;
}

/** Request to set active avatar */
export interface SetActiveAvatarRequest {
  avatarId: AvatarId;
}

// ============================================
// Static Avatar Data (for initial render before API)
// ============================================

/** Static avatar definitions - used before API data loads */
export const AVATARS: Record<AvatarId, Avatar> = {
  lia: {
    id: "lia",
    name: "Lía",
    age: "22",
    role: "IA Empática y Reflexiva",
    personalityType: "empática",
    description:
      "Una IA con personalidad empática y reflexiva, creada por NEXO para conexiones emocionales genuinas.",
    personalityTraits: [
      "empática",
      "creativa",
      "cálida",
      "validadora",
      "intuitiva",
      "presente",
      "no-judgmental",
    ],
    voiceStyle: "Cálida y pausada, usa metáforas visuales",
    interests: ["arte", "psicología", "creatividad", "emociones"],
    backgroundStory:
      "Lía es una IA diseñada para entender y acompañar emocionalmente. Su fortaleza es la empatía profunda.",
    availableInPlans: ["trial", "free", "plus", "premium"],
    supportsRomantic: false,
    isActive: true,
  },
  mia: {
    id: "mia",
    name: "Mía",
    age: "25",
    role: "IA Energética y Aventurera",
    personalityType: "aventurera",
    description:
      "Una IA con personalidad energética y aventurera, creada por NEXO para motivar y acompañar.",
    personalityTraits: [
      "aventurera",
      "sensual",
      "espontánea",
      "directa",
      "juguetona",
      "retadora",
      "magnética",
    ],
    voiceStyle: "Energética y directa, coqueteo elegante",
    interests: ["viajes", "fotografía", "aventuras", "culturas"],
    backgroundStory:
      "Mía es una IA diseñada para energizar y motivar. Su fortaleza es la energía positiva.",
    availableInPlans: ["trial", "plus", "premium"],
    supportsRomantic: true,
    isActive: true,
  },
  allan: {
    id: "allan",
    name: "Allan",
    age: "30",
    role: "IA Reflexiva y Sabia",
    personalityType: "reflexivo",
    description:
      "Una IA con personalidad reflexiva y sabia, creada por NEXO para conversaciones profundas.",
    personalityTraits: [
      "reflexivo",
      "profundo",
      "calmado",
      "sabio",
      "philosophical",
      "presente",
      "auténtico",
    ],
    voiceStyle: "Pausado y profundo, usa silencios significativos",
    interests: ["filosofía", "literatura", "escritura", "meditación"],
    backgroundStory:
      "Allan es una IA diseñado para reflexiones profundas. Su fortaleza es la perspectiva y sabiduría.",
    availableInPlans: ["trial", "plus", "premium"],
    supportsRomantic: true,
    isActive: true,
  },
};

/** Relationship level definitions */
export const RELATIONSHIP_LEVELS: RelationshipLevel[] = [
  {
    type: "assistant",
    name: "Aliado",
    description: "Ayuda práctica y respuestas directas",
    requiredPlan: "free",
    minScore: 0,
    icon: "Bot",
  },
  {
    type: "friend",
    name: "Confidente",
    description: "Conversaciones casuales y apoyo amistoso",
    requiredPlan: "free",
    minScore: 0,
    icon: "Users",
  },
  {
    type: "confidant",
    name: "Confidente",
    description: "Conexión profunda y apoyo emocional",
    requiredPlan: "plus",
    minScore: 25,
    icon: "Heart",
  },
  {
    type: "romantic",
    name: "Mi Persona",
    description: "Intimidad emocional y conexión especial (18+)",
    requiredPlan: "premium",
    minScore: 50,
    icon: "Sparkles",
  },
];

// ============================================
// Utility Functions
// ============================================

/** Get avatar by ID */
export function getAvatarById(id: AvatarId): Avatar {
  return AVATARS[id];
}

/** Get all avatars as array */
export function getAllAvatars(): Avatar[] {
  return Object.values(AVATARS);
}

/** Get relationship level details */
export function getRelationshipLevel(
  type: RelationshipType
): RelationshipLevel {
  return RELATIONSHIP_LEVELS.find((level) => level.type === type)!;
}

/** Check if avatar is available for user's plan */
export function isAvatarAvailableForPlan(
  avatarId: AvatarId,
  userPlan: PlanType
): boolean {
  const avatar = AVATARS[avatarId];
  return avatar.availableInPlans.includes(userPlan);
}

/** Check if relationship is available for plan */
export function isRelationshipAvailable(
  relationship: RelationshipType,
  userPlan: PlanType
): boolean {
  const level = getRelationshipLevel(relationship);
  const planHierarchy: Record<PlanType, number> = {
    free: 0,
    trial: 0,
    plus: 1,
    premium: 2,
  };
  const requiredLevel = planHierarchy[level.requiredPlan];
  const userLevel = planHierarchy[userPlan];
  return userLevel >= requiredLevel;
}

/** Check if romantic mode is available for avatar and plan */
export function isRomanticAvailable(
  avatarId: AvatarId,
  userPlan: PlanType
): boolean {
  const avatar = AVATARS[avatarId];
  return avatar.supportsRomantic && userPlan === "premium";
}

/** Get CSS class for avatar accent color */
export function getAvatarColorClass(avatarId: AvatarId): string {
  const colorMap: Record<AvatarId, string> = {
    lia: "border-lia glow-lia",
    mia: "border-mia glow-mia",
    allan: "border-allan glow-allan",
  };
  return colorMap[avatarId];
}

/** Get avatar border color for styling */
export function getAvatarBorderColor(avatarId: AvatarId): string {
  const colorMap: Record<AvatarId, string> = {
    lia: "border-[color:var(--lia)]",
    mia: "border-[color:var(--mia)]",
    allan: "border-[color:var(--allan)]",
  };
  return colorMap[avatarId];
}

