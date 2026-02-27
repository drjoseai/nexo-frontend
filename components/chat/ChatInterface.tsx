// components/chat/ChatInterface.tsx
// Interfaz principal de chat para NEXO v2.0

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store/chat";
import { useAuthStore } from "@/lib/store/auth";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import { FilePreview } from "./FilePreview";
import { RelationshipTypeSelector } from "./RelationshipTypeSelector";
import { DeleteHistoryButton } from "./DeleteHistoryButton";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/services/toast-service";
import { validateFile } from "@/lib/api/files";
import type { AvatarId, RelationshipType } from "@/types/chat";
import { AVATARS, getAvatarImageByMode } from "@/types/avatar";
import { ImageLightbox } from "./ImageLightbox";
import { BoostPopup } from "./BoostPopup";
import { analytics, AnalyticsEvents } from "@/lib/services/analytics";

// ============================================
// DATE SEPARATOR HELPER
// ============================================

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Hoy";
  if (isYesterday) return "Ayer";

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function shouldShowDateSeparator(
  currentMsg: { timestamp: Date },
  prevMsg: { timestamp: Date } | undefined
): boolean {
  if (!prevMsg) return true;
  return currentMsg.timestamp.toDateString() !== prevMsg.timestamp.toDateString();
}

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
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isAvatarLightboxOpen, setIsAvatarLightboxOpen] = useState(false);

  useEffect(() => {
    analytics.track(AnalyticsEvents.AVATAR_SELECTED, {
      avatar_id: avatarId,
      avatar_name: avatar?.name || avatarId,
    });
  }, [avatarId, avatar?.name]);

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
    isStreaming,
    streamingMessageId,
    error,
    messagesRemaining,
    sendMessage,
    loadHistory,
    clearMessages,
    clearError,
    deleteHistory,
    uploadLimits,
    fileUploading,
    fetchUploadLimits,
    showBoostPopup,
    boostDailyLimit,
    closeBoostPopup,
    miPersonaRemaining,
    boostRemaining,
  } = useChatStore();

  // Auth store para obtener plan del usuario
  const user = useAuthStore((state) => state.user);
  const userPlan = user?.plan || "free";
  const tRel = useTranslations("relationshipTypes");

  // Cargar historial al montar y al cambiar relationship type
  useEffect(() => {
    clearMessages();
    loadHistory(avatarId, undefined, relationshipType);
  }, [avatarId, relationshipType, loadHistory, clearMessages]);

  // Fetch upload limits al montar
  useEffect(() => {
    fetchUploadLimits();
  }, [fetchUploadLimits]);

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
    toast.success(`${tRel("changedTo")}: ${tRel(newType === "assistant" ? "assistant" : newType === "friend" ? "friend" : "romantic")}`);
  };

  // Handler cuando se requiere premium
  const handlePremiumRequired = () => {
    toast.error("Esta función requiere el plan Premium", {
      duration: 4000,
    });
    // TODO: Aquí se podría abrir un modal de upgrade o redirigir a /dashboard/subscription
  };

  // Handler para selección de archivo
  const handleFileSelected = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Archivo no válido");
      return;
    }
    setPendingFile(file);
  };

  // Handler para enviar mensaje
  const handleSendMessage = async (content: string) => {
    const fileToSend = pendingFile;
    setPendingFile(null);

    if (fileToSend) {
      // Archivos usan endpoint síncrono (streaming no soporta attachments)
      await sendMessage(content, avatarId, relationshipType, fileToSend);
    } else {
      // Mensajes de texto usan streaming SSE
      const { sendMessageStreaming } = useChatStore.getState();
      await sendMessageStreaming(content, avatarId, relationshipType);
    }
  };

  // Handler para borrar historial (solo del relationship type actual)
  const handleDeleteHistory = async () => {
    await deleteHistory(avatarId, relationshipType);
    toast.success("Historial borrado correctamente");
  };

  // Avatar colors para el header
  const avatarColorClass = {
    lia: "text-primary",
    mia: "text-amber-400",
    allan: "text-[var(--allan)]",
  }[avatarId];

  return (
    <div className="flex h-[100dvh] lg:h-full">
      {/* ============================================ */}
      {/* AVATAR SIDEBAR - Solo visible en pantallas grandes */}
      {/* ============================================ */}
      <div className="hidden lg:flex flex-col items-center justify-center w-48 border-r border-white/10 bg-black/20 p-4">
        <button
          onClick={() => setIsAvatarLightboxOpen(true)}
          className="group/avatar cursor-pointer focus:outline-none"
          aria-label={`Ver foto de ${avatar?.name}`}
        >
          <div
            className={cn(
              "relative w-36 h-36 rounded-full overflow-hidden transition-transform duration-200 group-hover/avatar:scale-105",
              "avatar-animated",
              `avatar-glow-${avatarId}`
            )}
          >
            <Image
              src={getAvatarImageByMode(avatarId, relationshipType as RelationshipType)}
              alt={avatar?.name || "Avatar"}
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </button>
        <p className={cn("mt-4 font-semibold text-lg", avatarColorClass)}>
          {avatar?.name}
        </p>
        <p className="text-xs text-white/50 mt-1">
          {isSending ? "Escribiendo..." : "En línea"}
        </p>
      </div>

      {/* Avatar photo lightbox */}
      <ImageLightbox
        imageUrl={getAvatarImageByMode(avatarId, relationshipType as RelationshipType)}
        filename={`${avatar?.name} - ${relationshipType}`}
        isOpen={isAvatarLightboxOpen}
        onClose={() => setIsAvatarLightboxOpen(false)}
      />

      {/* ============================================ */}
      {/* MAIN CHAT AREA */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/10 bg-background/95 px-4 py-3 backdrop-blur-md">
          {/* Botón volver */}
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver al dashboard</span>
            </Button>
          </Link>

          {/* Info del avatar */}
          <div className="flex items-center gap-3">
            {/* Avatar circle - photo changes based on relationship mode */}
            <button
              onClick={() => setIsAvatarLightboxOpen(true)}
              className="group/headeravatar cursor-pointer focus:outline-none"
              aria-label={`Ver foto de ${avatar?.name}`}
            >
              <div
                className={cn(
                  "relative h-10 w-10 rounded-full overflow-hidden transition-transform duration-200 group-hover/headeravatar:scale-110",
                  "border-2",
                  avatarId === "lia" ? "border-primary" : 
                  avatarId === "mia" ? "border-amber-400" : "border-[var(--allan)]"
                )}
              >
                <Image
                  src={getAvatarImageByMode(avatarId, relationshipType as RelationshipType)}
                  alt={avatar?.name || "Avatar"}
                  fill
                  className="object-cover object-top"
                />
              </div>
            </button>

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

          {/* Delete History Button & Relationship Type Selector */}
          <div className="ml-auto flex items-center gap-2">
            {/* Delete History Button - solo visible si hay mensajes */}
            {messages.length > 0 && (
              <DeleteHistoryButton
                avatarName={avatar?.name || "Avatar"}
                onDelete={handleDeleteHistory}
                disabled={isSending || isLoading}
              />
            )}

            <RelationshipTypeSelector
              value={relationshipType}
              onChange={handleRelationshipTypeChange}
              userPlan={userPlan}
              onPremiumRequired={handlePremiumRequired}
              disabled={isSending || isLoading}
              ageVerified={user?.age_verified ?? false}
            />

            {/* Mi Persona counter */}
            {relationshipType === "romantic" && userPlan === "premium" && miPersonaRemaining !== null && (
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border",
                miPersonaRemaining > 10
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  : miPersonaRemaining > 0
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              )}>
                <Sparkles className="h-3 w-3" />
                <span>{miPersonaRemaining}{boostRemaining ? ` +${boostRemaining}` : ""}</span>
              </div>
            )}

            {/* Mensajes restantes */}
            {messagesRemaining !== null && (
              <div className="text-xs text-white/40">
                {messagesRemaining} mensajes
              </div>
            )}
          </div>
        </header>

        {/* ============================================ */}
        {/* AVATAR SECTION - Solo visible en móvil cuando chat está vacío */}
        {/* ============================================ */}
        {!isLoading && messages.length === 0 && (
          <div className="flex lg:hidden flex-col items-center py-4 border-b border-white/10 bg-gradient-to-b from-black/20 to-transparent">
            <div
              className={cn(
                "relative w-24 h-24 rounded-full overflow-hidden",
                "avatar-animated",
                `avatar-glow-${avatarId}`
              )}
            >
              <Image
                src={`/avatars/${avatarId}.webp`}
                alt={avatar?.name || "Avatar"}
                fill
                className="object-cover object-top"
                priority
              />
            </div>
            <p className={cn("mt-3 font-semibold text-lg", avatarColorClass)}>
              {avatar?.name}
            </p>
            <p className="text-xs text-white/50 mt-1">
              {isSending ? "Escribiendo..." : "En línea"}
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* MESSAGES AREA */}
        {/* ============================================ */}
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-4">
          {/* Loading state */}
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              {/* Avatar solo en desktop (en móvil ya está arriba) */}
              <div
                className={cn(
                  "mb-4 hidden lg:flex h-16 w-16 items-center justify-center rounded-full",
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
              {messages.map((message, index) => (
                <div key={message.id}>
                  {shouldShowDateSeparator(message, messages[index - 1]) && (
                    <div className="flex items-center justify-center my-4">
                      <div className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium text-white/50 shadow-sm backdrop-blur-sm">
                        {getDateLabel(message.timestamp)}
                      </div>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    avatarId={avatarId}
                    avatarName={avatar?.name}
                    isStreaming={isStreaming && message.id === streamingMessageId}
                  />
                </div>
              ))}

              {/* Typing indicator - solo antes del primer token, NO durante streaming */}
              {isSending && !isStreaming && (
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/40" />
                  </div>
                  <span>{avatar?.name} está pensando...</span>
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
          <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
                {/* Mostrar botón de upgrade si es error de límite */}
                {(error.includes("límite") || error.includes("limit")) && (
                  <Link 
                    href="/dashboard/subscription" 
                    className="inline-block mt-2 text-xs text-primary hover:text-primary/80 underline"
                  >
                    Actualizar a Premium para mensajes ilimitados →
                  </Link>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-400 hover:text-red-300 shrink-0"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* INPUT AREA */}
        {/* ============================================ */}
        <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-md">
          {/* File Preview (si hay archivo pendiente) */}
          {pendingFile && (
            <FilePreview
              file={pendingFile}
              onRemove={() => setPendingFile(null)}
            />
          )}

          {/* Chat Input */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isLoading || fileUploading}
            sendDisabled={isSending}
            placeholder={`Escribe a ${avatar?.name || "tu avatar"}...`}
            onFileSelected={handleFileSelected}
            fileUploading={fileUploading}
            uploadRemaining={uploadLimits?.remaining}
            hasPendingFile={!!pendingFile}
          />

          {/* AI Disclaimer */}
          <p className="mt-2 text-center text-[11px] text-white/30">
            NEXO is an AI companion — not a real person. Do not share sensitive personal information.
          </p>
        </div>
      </div>

      <BoostPopup
        isOpen={showBoostPopup}
        onClose={closeBoostPopup}
        dailyLimit={boostDailyLimit}
      />
    </div>
  );
}

export default ChatInterface;

