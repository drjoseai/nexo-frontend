"use client";

/**
 * LanguageSelector Component
 * Allows users to switch between supported languages
 */

import { useCallback } from "react";
import { Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  locales,
  localeNames,
  localeFlags,
  Locale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
} from "@/i18n/config";

interface LanguageSelectorProps {
  currentLocale?: Locale;
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSelector({
  currentLocale = "es",
  variant = "ghost",
  showLabel = true,
  className,
}: LanguageSelectorProps) {
  const handleLocaleChange = useCallback(
    (newLocale: Locale) => {
      // Set cookie with new locale preference
      document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE * 24 * 60 * 60}; SameSite=Lax`;

      // Hard reload to apply new locale (more stable than router.refresh with Turbopack)
      window.location.reload();
    },
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={showLabel ? "default" : "icon"}
          className={className}
          disabled={false}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="ml-2">
              {localeFlags[currentLocale]} {localeNames[currentLocale]}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={locale === currentLocale ? "bg-accent" : ""}
          >
            <span className="mr-2">{localeFlags[locale]}</span>
            {localeNames[locale]}
            {locale === currentLocale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;

