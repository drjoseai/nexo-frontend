"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Lock, MessageCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AvatarId, RelationshipType, PlanType } from "@/types/avatar";
import { AVATARS, isAvatarAvailableForPlan } from "@/types/avatar";

interface AvatarCardProps {
  avatarId: AvatarId;
  userPlan: PlanType;
  currentRelationship?: RelationshipType;
  messageCount?: number;
  isLocked?: boolean;
  className?: string;
}

function getAvatarStyles(avatarId: AvatarId) {
  const styles: Record<AvatarId, { 
    border: string; 
    glow: string; 
    gradient: string;
    bgColor: string;
    textColor: string;
  }> = {
    lia: {
      border: "border-[var(--lia)]",
      glow: "shadow-[0_0_20px_color-mix(in_oklch,var(--lia)_30%,transparent)]",
      gradient: "from-[var(--lia)]/20 to-transparent",
      bgColor: "bg-[var(--lia)]/20",
      textColor: "text-[var(--lia)]",
    },
    mia: {
      border: "border-[var(--mia)]",
      glow: "shadow-[0_0_20px_color-mix(in_oklch,var(--mia)_30%,transparent)]",
      gradient: "from-[var(--mia)]/20 to-transparent",
      bgColor: "bg-[var(--mia)]/20",
      textColor: "text-[var(--mia)]",
    },
    allan: {
      border: "border-[var(--allan)]",
      glow: "shadow-[0_0_20px_color-mix(in_oklch,var(--allan)_30%,transparent)]",
      gradient: "from-[var(--allan)]/20 to-transparent",
      bgColor: "bg-[var(--allan)]/20",
      textColor: "text-[var(--allan)]",
    },
  };
  return styles[avatarId];
}


function AvatarImage({ 
  avatarId, 
  name 
}: { 
  avatarId: AvatarId; 
  name: string;
}) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={`/avatars/${avatarId}_main.png`}
        alt={name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        priority
      />
    </div>
  );
}

export function AvatarCard({
  avatarId,
  userPlan,
  currentRelationship: _currentRelationship = "friend",
  messageCount = 0,
  isLocked: forceLockedState,
  className,
}: AvatarCardProps) {
  const t = useTranslations();
  const avatar = AVATARS[avatarId];
  const styles = getAvatarStyles(avatarId);
  const isLocked = forceLockedState ?? !isAvatarAvailableForPlan(avatarId, userPlan);

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
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-32 bg-gradient-to-b pointer-events-none z-10",
          styles.gradient
        )}
      />

      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <AvatarImage avatarId={avatarId} name={avatar.name} />

        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-2 text-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {t("avatars.planPlusRequired")}
              </span>
            </div>
          </div>
        )}

        {avatar.supportsRomantic && !isLocked && (
          <div className="absolute right-2 top-2 z-20">
            <Badge variant="secondary" className="gap-1 bg-accent/90 text-accent-foreground">
              <Sparkles className="h-3 w-3" />
              18+
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary/80">
          {t(`avatars.${avatarId}.showcaseMode`)}
        </p>

        <div className="mb-1 flex items-baseline gap-2">
          <h3 className="text-xl font-bold">{avatar.name}</h3>
          <span className="text-sm text-muted-foreground">{avatar.age}</span>
        </div>

        <p className="mb-2 text-sm font-medium text-foreground">
          {t(`avatars.${avatarId}.role`)}
        </p>

        <p className="mb-3 text-xs text-muted-foreground line-clamp-2">
          {t(`avatars.${avatarId}.description`)}
        </p>

        <div className="mt-auto flex items-center justify-between">
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

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link href={`/dashboard/chat/${avatarId}`} className="block">
      {cardContent}
    </Link>
  );
}

export function AvatarCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-2 border-border bg-card">
      <div className="aspect-[3/4] w-full animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-auto h-5 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
