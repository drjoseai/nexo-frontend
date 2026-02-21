"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookiePreferencesProps {
  initialAnalytics: boolean;
  onSave: (analytics: boolean) => void;
}

export function CookiePreferences({ initialAnalytics, onSave }: CookiePreferencesProps) {
  const t = useTranslations("cookies");
  const [analytics, setAnalytics] = useState(initialAnalytics);

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{t("categories.essential.title")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("categories.essential.description")}
          </p>
        </div>
        <Switch checked disabled aria-label={t("categories.essential.title")} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="analytics-toggle" className="text-sm font-medium">
            {t("categories.analytics.title")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t("categories.analytics.description")}
          </p>
        </div>
        <Switch
          id="analytics-toggle"
          checked={analytics}
          onCheckedChange={setAnalytics}
          aria-label={t("categories.analytics.title")}
        />
      </div>

      <Button onClick={() => onSave(analytics)} className="w-full" size="sm">
        {t("banner.savePreferences")}
      </Button>
    </div>
  );
}
