"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";
import { CookiePreferences } from "./CookiePreferences";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const { hasConsent, loaded, updateConsent } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);

  if (!loaded || hasConsent) return null;

  return (
    <div
      role="dialog"
      aria-label={t("banner.title")}
      className="fixed bottom-0 inset-x-0 z-50 animate-in slide-in-from-bottom duration-300"
    >
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold">{t("banner.title")}</h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {t("banner.description")}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button onClick={() => updateConsent(true)} size="sm" className="sm:order-3">
                {t("banner.acceptAll")}
              </Button>
              <Button
                onClick={() => updateConsent(false)}
                variant="outline"
                size="sm"
                className="sm:order-2"
              >
                {t("banner.rejectNonEssential")}
              </Button>
              <Button
                onClick={() => setShowPreferences((prev) => !prev)}
                variant="ghost"
                size="sm"
                className="sm:order-1"
              >
                {t("banner.managePreferences")}
              </Button>
            </div>

            {showPreferences && (
              <CookiePreferences initialAnalytics={false} onSave={updateConsent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
