// app/dashboard/chat/[avatarId]/page.tsx
// Página de chat con avatar específico - NEXO v2.0

import { notFound } from "next/navigation";
import { ChatInterfaceLazy } from "@/components/chat/ChatInterfaceLazy";
import { AVATARS } from "@/types/avatar";
import type { AvatarId } from "@/types/chat";
import type { Metadata } from "next";

// ============================================
// TIPOS
// ============================================

interface ChatPageProps {
  params: Promise<{
    avatarId: string;
  }>;
}

// ============================================
// METADATA DINÁMICA
// ============================================

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { avatarId } = await params;
  const avatar = AVATARS[avatarId as AvatarId];

  if (!avatar) {
    return {
      title: "Avatar no encontrado | NEXO",
    };
  }

  return {
    title: `Chat con ${avatar.name} | NEXO`,
    description: `Conversa con ${avatar.name}, ${avatar.role.toLowerCase()}. ${avatar.description}`,
  };
}

// ============================================
// VALIDACIÓN DE AVATAR
// ============================================

const VALID_AVATAR_IDS: AvatarId[] = ["lia", "mia", "allan"];

function isValidAvatarId(id: string): id is AvatarId {
  return VALID_AVATAR_IDS.includes(id as AvatarId);
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function ChatPage({ params }: ChatPageProps) {
  const { avatarId } = await params;

  // Validar que el avatar existe
  if (!isValidAvatarId(avatarId)) {
    notFound();
  }

  // Verificar que el avatar está en AVATARS
  const avatar = AVATARS[avatarId];
  if (!avatar) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-2rem)] overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm">
      <ChatInterfaceLazy avatarId={avatarId} />
    </div>
  );
}

