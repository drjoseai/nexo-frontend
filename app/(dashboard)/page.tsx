"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { AvatarCard, AvatarCardSkeleton } from "@/components/avatars/AvatarCard";
import { getAllAvatars } from "@/types/avatar";
import type { AvatarId, PlanType, RelationshipType } from "@/types/avatar";
import { Sparkles } from "lucide-react";
import Link from "next/link";

// Temporary mock data for relationships (will come from API later)
interface UserAvatarRelationship {
  avatarId: AvatarId;
  relationship: RelationshipType;
  messageCount: number;
}

const mockRelationships: UserAvatarRelationship[] = [
  { avatarId: "lia", relationship: "friend", messageCount: 0 },
  { avatarId: "mia", relationship: "assistant", messageCount: 0 },
  { avatarId: "allan", relationship: "assistant", messageCount: 0 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [relationships, setRelationships] = useState<UserAvatarRelationship[]>([]);

  // Get all avatars from static data
  const avatars = getAllAvatars();

  // Simulate loading relationships (replace with API call later)
  useEffect(() => {
    const loadRelationships = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const summary = await avatarsApi.getRelationshipsSummary();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
        setRelationships(mockRelationships);
      } catch (error) {
        console.error("Error loading relationships:", error);
        setRelationships(mockRelationships);
      } finally {
        setIsLoading(false);
      }
    };

    loadRelationships();
  }, []);

  // Get relationship data for an avatar
  const getAvatarRelationship = (avatarId: AvatarId) => {
    return relationships.find((r) => r.avatarId === avatarId);
  };

  // Get user's plan (default to 'free' if not available)
  const userPlan: PlanType = (user?.plan as PlanType) || "free";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          <span className="text-gradient">¡Hola</span>
          {user?.display_name ? `, ${user.display_name}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          ¿Con quién quieres hablar hoy?
        </p>
      </div>

      {/* Plan upgrade banner for free users */}
      {(userPlan === "free" || userPlan === "trial") && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="font-medium">Desbloquea todos los avatares</p>
            <p className="text-sm text-muted-foreground">
              Actualiza a Plus para acceder a Mía y Allan
            </p>
          </div>
          <Link
            href="/dashboard/subscription"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ver planes
          </Link>
        </div>
      )}

      {/* Avatar grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? // Show skeletons while loading
            Array.from({ length: 3 }).map((_, i) => (
              <AvatarCardSkeleton key={i} />
            ))
          : // Show avatar cards
            avatars.map((avatar) => {
              const relationship = getAvatarRelationship(avatar.id);
              return (
                <AvatarCard
                  key={avatar.id}
                  avatarId={avatar.id}
                  userPlan={userPlan}
                  currentRelationship={relationship?.relationship}
                  messageCount={relationship?.messageCount}
                />
              );
            })}
      </div>

      {/* Tip for new users */}
      {relationships.every((r) => r.messageCount === 0) && !isLoading && (
        <div className="rounded-lg border border-border bg-card/50 p-6 text-center">
          <p className="text-muted-foreground">
            👋 <span className="font-medium text-foreground">¡Bienvenido a NEXO!</span>{" "}
            Haz clic en un avatar para comenzar tu primera conversación.
          </p>
        </div>
      )}
    </div>
  );
}

