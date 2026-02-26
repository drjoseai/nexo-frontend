"use client";

import { useState } from "react";
import { Sparkles, Zap } from "lucide-react";
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

interface BoostPopupProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLimit: number;
}

export function BoostPopup({ isOpen, onClose, dailyLimit }: BoostPopupProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchaseBoost = async () => {
    setIsLoading(true);
    try {
      const baseUrl = window.location.origin;
      const currentPath = window.location.pathname;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stripe/purchase-boost`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            success_url: `${baseUrl}${currentPath}?boost=success`,
            cancel_url: `${baseUrl}${currentPath}?boost=cancelled`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al iniciar compra");
      }

      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error("Boost purchase error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#1a1a2e] border-white/10 max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            My Person Messages
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/70">
            You&apos;ve used your {dailyLimit} daily My Person messages.
            Get 50 more to keep the conversation going!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-amber-400" />
              <span className="text-2xl font-bold text-white">+50</span>
              <span className="text-white/60 text-sm">messages</span>
            </div>
            <p className="text-amber-400 font-semibold text-lg">$0.99</p>
            <p className="text-white/40 text-xs mt-1">One-time purchase</p>
          </div>

          <Button
            onClick={handlePurchaseBoost}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3"
          >
            {isLoading ? "Redirecting..." : "Get 50 Messages — $0.99"}
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="w-full bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          >
            Maybe later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
