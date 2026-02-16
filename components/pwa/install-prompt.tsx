"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/lib/hooks/use-pwa";
import { useTranslations } from "next-intl";

export function PWAInstallPrompt() {
  const {
    isInstalled,
    isIOS,
    canInstall,
    isDismissed,
    triggerPrompt,
    promptInstall,
    dismissInstall,
  } = usePWA();
  const t = useTranslations("pwa.install");
  const [showPrompt, setShowPrompt] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (isInstalled || isDismissed || triggerPrompt) return;

    if (canInstall || isIOS) {
      const timer = setTimeout(() => setShowPrompt(true), 20000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isIOS, isInstalled, isDismissed, triggerPrompt]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowPrompt(false);
      setHidden(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHidden(true);
    dismissInstall();
  };

  const shouldShow = !hidden && (triggerPrompt || showPrompt);
  if (isInstalled || !shouldShow) return null;

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
            <h3 className="font-semibold text-foreground">{t("title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("description")}
            </p>

            {isIOS ? (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  {t("iosStep1")}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t("iosStep2")}
                </p>
              </div>
            ) : (
              <Button onClick={handleInstall} size="sm" className="mt-3 gap-2">
                <Download className="w-4 h-4" />
                {t("button")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
