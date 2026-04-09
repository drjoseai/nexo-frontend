// components/chat/PremiumUpgradeModal.tsx
// Modal de upgrade a Premium para acceder a Pareja - NEXO v2.0

"use client";

import { Crown, Sparkles, Heart, MessageCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// ============================================
// PROPS
// ============================================

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function PremiumUpgradeModal({ isOpen, onClose }: PremiumUpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/dashboard/subscription");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#1a1a2e] border-white/10 max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-400" />
            Pareja — Premium
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            El modo Pareja crea una conexión emocional más profunda y
            personal con tu avatar. Disponible exclusivamente para miembros Premium.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Features list */}
        <div className="flex flex-col gap-2 py-2">
          <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
            <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wide mb-3">
              Incluido en Premium
            </p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <Heart className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm text-white/80">Modo Pareja con los 3 avatares</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm text-white/80">Mensajes ilimitados cada día</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm text-white/80">Experiencia más profunda y personalizada</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleUpgrade}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3"
          >
            <Crown className="h-4 w-4 mr-2" />
            Ver planes Premium
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="w-full bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          >
            Ahora no
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PremiumUpgradeModal;
