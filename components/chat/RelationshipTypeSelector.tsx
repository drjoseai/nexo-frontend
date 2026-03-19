// components/chat/RelationshipTypeSelector.tsx
// Selector para el tipo de relación en el chat - NEXO v2.0

"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analytics, AnalyticsEvents } from "@/lib/services/analytics";
import type { RelationshipType } from "@/types/chat";
import type { UserPlan } from "@/types/auth";
import { AgeVerificationModal } from "./AgeVerificationModal";

// ============================================
// TYPES
// ============================================

interface RelationshipOption {
  value: RelationshipType;
  label: string;
  description: string;
  premiumOnly: boolean;
  icon?: string;
}

interface RelationshipTypeSelectorProps {
  value: RelationshipType;
  onChange: (value: RelationshipType) => void;
  userPlan: UserPlan;
  onPremiumRequired?: () => void;
  disabled?: boolean;
  ageVerified?: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isPremiumPlan(plan: UserPlan): boolean {
  return plan === "premium";
}

function canAccessOption(option: RelationshipOption, userPlan: UserPlan): boolean {
  if (!option.premiumOnly) return true;
  return isPremiumPlan(userPlan);
}

// ============================================
// COMPONENT
// ============================================

export function RelationshipTypeSelector({
  value,
  onChange,
  userPlan,
  onPremiumRequired,
  disabled = false,
  ageVerified = false,
}: RelationshipTypeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<RelationshipOption | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("relationshipTypes");

  useEffect(() => {
    if (!open) return;
    let timeoutId: NodeJS.Timeout;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
    {
      value: "assistant",
      label: t("assistant"),
      description: t("assistantDescription"),
      premiumOnly: false,
      icon: "🤝",
    },
    {
      value: "friend",
      label: t("friend"),
      description: t("friendDescription"),
      premiumOnly: false,
      icon: "💛",
    },
    {
      value: "romantic",
      label: t("romantic"),
      description: t("romanticDescription"),
      premiumOnly: true,
      icon: "💕",
    },
  ];

  const currentOption = RELATIONSHIP_OPTIONS.find((opt) => opt.value === value) || RELATIONSHIP_OPTIONS[0];
  const canAccessCurrent = canAccessOption(currentOption, userPlan);

  const handleSelect = (option: RelationshipOption) => {
    // Check premium plan requirement
    if (!canAccessOption(option, userPlan)) {
      setOpen(false);
      if (onPremiumRequired) {
        onPremiumRequired();
      }
      return;
    }

    // Check age verification for romantic mode
    if (option.value === "romantic" && !ageVerified) {
      setOpen(false);
      setPendingSelection(option);
      setShowAgeModal(true);
      return;
    }

    // All checks passed, change relationship type
    analytics.track(AnalyticsEvents.RELATIONSHIP_CHANGED, {
      new_relationship: option.value,
      previous_relationship: value,
    });
    onChange(option.value);
    setOpen(false);
  };

  const handleAgeVerified = () => {
    // User verified age, apply pending selection
    if (pendingSelection) {
      analytics.track(AnalyticsEvents.RELATIONSHIP_CHANGED, {
        new_relationship: pendingSelection.value,
        previous_relationship: value,
      });
      onChange(pendingSelection.value);
      setPendingSelection(null);
    }
  };

  return (
    <>
      <div ref={dropdownRef} className="relative inline-block">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "h-8 gap-1.5 border border-white/10 bg-white/5 px-3 text-xs",
            "hover:bg-white/10 hover:border-white/20",
            "transition-all duration-200",
            !canAccessCurrent && "border-amber-500/30 bg-amber-500/10"
          )}
        >
          <span className="text-sm">{currentOption.icon}</span>
          <span className="font-medium text-white/90">{currentOption.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-1 w-64 rounded-md border border-white/10 bg-black/95 p-1 shadow-lg backdrop-blur-xl"
          >
            <div className="px-2 py-1.5 text-xs font-medium text-white/40">
              {t("selectorTitle")}
            </div>

            {RELATIONSHIP_OPTIONS.map((option) => {
              const isSelected = option.value === value;
              const canAccess = canAccessOption(option, userPlan);
              const isLocked = !canAccess;

              return (
                <div
                  key={option.value}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => !disabled && handleSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (!disabled) handleSelect(option);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-sm px-3 py-2.5",
                    "hover:bg-white/10 hover:text-white",
                    "transition-colors duration-150",
                    isLocked && "opacity-60",
                    isSelected && "bg-white/5",
                    disabled && "pointer-events-none opacity-50"
                  )}
                >
                  <span className="mt-0.5 text-lg">{option.icon}</span>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {option.label}
                      </span>
                      {isLocked && (
                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      {isSelected && canAccess && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-white/50">
                      {option.description}
                    </p>
                    {isLocked && (
                      <p className="mt-1 text-xs font-medium text-amber-500">
                        {t("premiumOnly")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="mt-1 border-t border-white/10 px-3 py-2 text-xs text-white/40">
              {isPremiumPlan(userPlan) ? (
                <span className="flex items-center gap-1.5">
                  <Crown className="h-3 w-3 text-amber-500" />
                  {t("premiumActive")}
                </span>
              ) : (
                <span>{t("upgradeForMore")}</span>
              )}
            </div>
          </div>
        )}
      </div>

      <AgeVerificationModal
        open={showAgeModal}
        onOpenChange={setShowAgeModal}
        onVerified={handleAgeVerified}
      />
    </>
  );
}

export default RelationshipTypeSelector;

