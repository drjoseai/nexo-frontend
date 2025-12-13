"use client";

import dynamic from "next/dynamic";
import { PageLoading } from "@/components/ui/loading-spinner";

// Lazy load ChatInterface con loading state
const ChatInterface = dynamic(
  () => import("./ChatInterface").then((mod) => ({ default: mod.ChatInterface })),
  {
    loading: () => (
      <div className="flex h-full flex-col">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-black/40 p-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
          </div>
        </div>
        
        {/* Messages area skeleton */}
        <div className="flex-1 p-4">
          <PageLoading text="Cargando chat..." />
        </div>
        
        {/* Input skeleton */}
        <div className="border-t border-white/10 bg-black/40 p-4">
          <div className="h-12 w-full animate-pulse rounded-lg bg-white/10" />
        </div>
      </div>
    ),
    ssr: false, // Chat requiere cliente
  }
);

interface ChatInterfaceLazyProps {
  avatarId: "lia" | "mia" | "allan";
}

export function ChatInterfaceLazy({ avatarId }: ChatInterfaceLazyProps) {
  return <ChatInterface avatarId={avatarId} />;
}

