"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Lazy initializers to avoid setState in effect
const getInitialStandalone = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
};

const getInitialIsIOS = () => {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS] = useState(getInitialIsIOS);
  const [isStandalone] = useState(getInitialStandalone);

  useEffect(() => {
    // Check if prompt was dismissed recently (24 hours)
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // For iOS, show custom prompt after 30 seconds
    if (isIOS && !isStandalone) {
      const timer = setTimeout(() => setShowPrompt(true), 30000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [isIOS, isStandalone]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 max-w-md mx-auto">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">N</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Install NEXO</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isIOS
                ? "Add NEXO to your home screen for the best experience"
                : "Install our app for quick access and offline support"}
            </p>

            {isIOS ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  Tap the share button
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Then &quot;Add to Home Screen&quot;
                </p>
              </div>
            ) : (
              <Button
                onClick={handleInstall}
                size="sm"
                className="mt-3 gap-2"
              >
                <Download className="w-4 h-4" />
                Install
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
