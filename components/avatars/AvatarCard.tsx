"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Lock, MessageCircle, Sparkles, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AvatarId, RelationshipType, PlanType } from "@/types/avatar";
import { AVATARS, RELATIONSHIP_LEVELS, isAvatarAvailableForPlan } from "@/types/avatar";

interface AvatarCardProps {
  avatarId: AvatarId;
  userPlan: PlanType;
  currentRelationship?: RelationshipType;
  messageCount?: number;
  isLocked?: boolean;
  className?: string;
}

/**
 * Get border and glow colors for each avatar
 */
function getAvatarStyles(avatarId: AvatarId) {
  const styles: Record<AvatarId, { 
    border: string; 
    glow: string; 
    gradient: string;
    bgColor: string;
    textColor: string;
  }> = {
    lia: {
      border: "border-[#7C3AED]",
      glow: "shadow-[0_0_20px_rgba(124,58,237,0.3)]",
      gradient: "from-[#7C3AED]/20 to-transparent",
      bgColor: "bg-[#7C3AED]/20",
      textColor: "text-[#7C3AED]",
    },
    mia: {
      border: "border-[#F59E0B]",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      gradient: "from-[#F59E0B]/20 to-transparent",
      bgColor: "bg-[#F59E0B]/20",
      textColor: "text-[#F59E0B]",
    },
    allan: {
      border: "border-[#06B6D4]",
      glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
      gradient: "from-[#06B6D4]/20 to-transparent",
      bgColor: "bg-[#06B6D4]/20",
      textColor: "text-[#06B6D4]",
    },
  };
  return styles[avatarId];
}

/**
 * Get relationship display info
 */
function getRelationshipDisplay(type: RelationshipType) {
  const level = RELATIONSHIP_LEVELS.find((l) => l.type === type);
  return level || RELATIONSHIP_LEVELS[0];
}

/**
 * Placeholder component for avatar image
 * Will be replaced with actual images later
 */
function AvatarPlaceholder({ 
  avatarId, 
  name 
}: { 
  avatarId: AvatarId; 
  name: string;
}) {
  const styles = getAvatarStyles(avatarId);
  
  return (
    <div 
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3",
        styles.bgColor
      )}
    >
      <User className={cn("h-20 w-20", styles.textColor)} />
      <span className={cn("text-2xl font-bold", styles.textColor)}>
        {name}
      </span>
    </div>
  );
}

export function AvatarCard({
  avatarId,
  userPlan,
  currentRelationship = "friend",
  messageCount = 0,
  isLocked: forceLockedState,
  className,
}: AvatarCardProps) {
  const avatar = AVATARS[avatarId];
  const styles = getAvatarStyles(avatarId);
  const relationshipInfo = getRelationshipDisplay(currentRelationship);
  
  // Determine if avatar is locked based on plan
  const isLocked = forceLockedState ?? !isAvatarAvailableForPlan(avatarId, userPlan);

  // Card content
  const cardContent = (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border-2 bg-card transition-all duration-300",
        styles.border,
        isLocked 
          ? "opacity-60 grayscale" 
          : cn("hover:scale-[1.02] cursor-pointer", styles.glow),
        className
      )}
    >
      {/* Gradient overlay at top */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-32 bg-gradient-to-b pointer-events-none z-10",
          styles.gradient
        )}
      />

      {/* Avatar image placeholder */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <AvatarPlaceholder avatarId={avatarId} name={avatar.name} />

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-2 text-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Plan Plus requerido
              </span>
            </div>
          </div>
        )}

        {/* Romantic badge if supported */}
        {avatar.supportsRomantic && !isLocked && (
          <div className="absolute right-2 top-2 z-20">
            <Badge variant="secondary" className="gap-1 bg-accent/90 text-accent-foreground">
              <Sparkles className="h-3 w-3" />
              18+
            </Badge>
          </div>
        )}
      </div>

      {/* Avatar info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Name and age */}
        <div className="mb-1 flex items-baseline gap-2">
          <h3 className="text-xl font-bold">{avatar.name}</h3>
          <span className="text-sm text-muted-foreground">{avatar.age}</span>
        </div>

        {/* Role */}
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
          {avatar.role}
        </p>

        {/* Relationship badge and message count */}
        <div className="mt-auto flex items-center justify-between">
          <Badge variant="outline" className="gap-1">
            {relationshipInfo.name}
          </Badge>

          {messageCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="h-3 w-3" />
              {messageCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If locked, don't wrap in link
  if (isLocked) {
    return cardContent;
  }

  // Wrap in link to chat
  return (
    <Link href={`/chat/${avatarId}`} className="block">
      {cardContent}
    </Link>
  );
}

/**
 * Skeleton loader for avatar card
 */
export function AvatarCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-2 border-border bg-card">
      {/* Image skeleton */}
      <div className="aspect-[3/4] w-full animate-pulse bg-muted" />

      {/* Info skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-auto h-5 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

