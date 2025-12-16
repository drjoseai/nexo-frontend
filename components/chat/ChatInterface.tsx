// components/chat/ChatInterface.tsx
// Interfaz principal de chat para NEXO v2.0

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store/chat";
import { useAuthStore } from "@/lib/store/auth";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { RelationshipTypeSelector } from "./RelationshipTypeSelector";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/services/toast-service";
import type { AvatarId, RelationshipType } from "@/types/chat";
import { AVATARS } from "@/types/avatar";

// ============================================
// PROPS INTERFACE
// ============================================

interface ChatInterfaceProps {
  avatarId: AvatarId;
}

// ============================================
// COMPONENT
// ============================================

export function ChatInterface({ avatarId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const avatar = AVATARS[avatarId];

  // Local storage key para relationship type
  const STORAGE_KEY = `nexo_relationship_${avatarId}`;

  // Estado local para relationship type
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(() => {
    // Cargar desde localStorage al iniciar
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ["assistant", "friend", "romantic"].includes(stored)) {
        return stored as RelationshipType;
      }
    }
    return "assistant"; // Default
  });

  // Store
  const {
    messages,
    isLoading,
    isSending,
    error,
    messagesRemaining,
    sendMessage,
    loadHistory,
    clearMessages,
    clearError,
  } = useChatStore();

  // Auth store para obtener plan del usuario
  const user = useAuthStore((state) => state.user);
  const userPlan = user?.plan || "free";

  // Cargar historial al montar
  useEffect(() => {
    clearMessages();
    loadHistory(avatarId);
  }, [avatarId, loadHistory, clearMessages]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Guardar relationship type en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, relationshipType);
    }
  }, [relationshipType, STORAGE_KEY]);

  // Handler para cambiar relationship type
  const handleRelationshipTypeChange = (newType: RelationshipType) => {
    setRelationshipType(newType);
    toast.success(`Tipo de relación cambiado a: ${
      newType === "assistant" ? "Asistente" :
      newType === "friend" ? "Amigo" : "Romántico"
    }`);
  };

  // Handler cuando se requiere premium
  const handlePremiumRequired = () => {
    toast.error("Esta función requiere el plan Premium", {
      duration: 4000,
    });
    // TODO: Aquí se podría abrir un modal de upgrade o redirigir a /dashboard/subscription
  };

  // Handler para enviar mensaje
  const handleSendMessage = async (content: string) => {
    await sendMessage(content, avatarId, relationshipType);
  };

  // Avatar colors para el header
  const avatarColorClass = {
    lia: "text-purple-400",
    mia: "text-amber-400",
    allan: "text-cyan-400",
  }[avatarId];

  return (
    <div className="flex h-full flex-col">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="flex items-center gap-4 border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
        {/* Botón volver */}
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Volver al dashboard</span>
          </Button>
        </Link>

        {/* Info del avatar */}
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              "bg-gradient-to-br from-white/10 to-white/5",
              "border border-white/20 text-lg font-semibold",
              avatarColorClass
            )}
          >
            {avatar?.name?.charAt(0) || "?"}
          </div>

          {/* Nombre y estado */}
          <div>
            <h1 className={cn("font-semibold", avatarColorClass)}>
              {avatar?.name || "Avatar"}
            </h1>
            <p className="text-xs text-white/50">
              {isSending ? "Escribiendo..." : "En línea"}
            </p>
          </div>
        </div>

        {/* Relationship Type Selector */}
        <div className="ml-auto flex items-center gap-3">
          <RelationshipTypeSelector
            value={relationshipType}
            onChange={handleRelationshipTypeChange}
            userPlan={userPlan}
            onPremiumRequired={handlePremiumRequired}
            disabled={isSending || isLoading}
          />

          {/* Mensajes restantes */}
          {messagesRemaining !== null && (
            <div className="text-xs text-white/40">
              {messagesRemaining} mensajes
            </div>
          )}
        </div>
      </header>

      {/* ============================================ */}
      {/* MESSAGES AREA */}
      {/* ============================================ */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
                "bg-gradient-to-br from-white/10 to-white/5",
                "border border-white/20 text-2xl font-bold",
                avatarColorClass
              )}
            >
              {avatar?.name?.charAt(0) || "?"}
            </div>
            <h2 className="text-lg font-medium text-white/80">
              Inicia una conversación con {avatar?.name}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-white/50">
              {avatar?.description || "Tu compañero de IA está listo para chatear."}
            </p>
          </div>
        )}

        {/* Messages list */}
        {!isLoading && messages.length > 0 && (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                avatarId={avatarId}
                avatarName={avatar?.name}
              />
            ))}

            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
                </div>
                <span>{avatar?.name} está escribiendo...</span>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* ERROR BANNER */}
      {/* ============================================ */}
      {error && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* INPUT AREA */}
      {/* ============================================ */}
      <div className="border-t border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <ChatInput
          onSend={handleSendMessage}
          disabled={isSending || isLoading}
          placeholder={`Escribe a ${avatar?.name || "tu avatar"}...`}
        />
      </div>
    </div>
  );
}

export default ChatInterface;

