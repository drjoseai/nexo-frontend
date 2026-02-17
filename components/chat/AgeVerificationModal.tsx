// components/chat/AgeVerificationModal.tsx
"use client";

import { useState } from "react";
import { AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { verifyAge } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth";

interface AgeVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export function AgeVerificationModal({
  open,
  onOpenChange,
  onVerified,
}: AgeVerificationModalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadUser } = useAuthStore();

  const handleVerify = async () => {
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyAge();

      if (result.success) {
        // Reload user to get updated age_verified status
        await loadUser();
        onVerified();
        onOpenChange(false);
        setConfirmed(false);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(
        error.response?.data?.detail || "Error al verificar edad. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setConfirmed(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-white/10 bg-black/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-primary" />
            Verificación de Edad
          </DialogTitle>
          <DialogDescription className="text-white/70">
            El modo romántico contiene contenido para mayores de 18 años.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning notice */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-500">
                  Requisito legal
                </p>
                <p className="text-xs text-white/70">
                  Debes ser mayor de 18 años para acceder a contenido romántico.
                  Al confirmar, declaras que cumples con este requisito.
                </p>
              </div>
            </div>
          </div>

          {/* Checkbox confirmation */}
          <div className="flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              id="age-confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
            />
            <label
              htmlFor="age-confirm"
              className="cursor-pointer text-sm text-white/90"
            >
              Confirmo que soy mayor de 18 años y acepto los términos de uso del
              modo romántico
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="text-white/70 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            disabled={!confirmed || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Verificando..." : "Verificar y Continuar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

