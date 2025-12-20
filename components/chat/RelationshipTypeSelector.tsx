// components/chat/RelationshipTypeSelector.tsx
// Selector para el tipo de relación en el chat - NEXO v2.0

"use client";

import { useState } from "react";
import { Check, ChevronDown, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
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
// CONSTANTS
// ============================================

const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  {
    value: "assistant",
    label: "Asistente",
    description: "Respuestas profesionales y útiles",
    premiumOnly: false,
    icon: "💼",
  },
  {
    value: "friend",
    label: "Amigo",
    description: "Conversación casual y amigable",
    premiumOnly: false,
    icon: "👋",
  },
  {
    value: "romantic",
    label: "Romántico",
    description: "Conexión emocional profunda",
    premiumOnly: true,
    icon: "💕",
  },
];

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
    onChange(option.value);
    setOpen(false);
  };

  const handleAgeVerified = () => {
    // User verified age, apply pending selection
    if (pendingSelection) {
      onChange(pendingSelection.value);
      setPendingSelection(null);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
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
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="px-2 py-1.5 text-xs font-medium text-white/40">
          Tipo de relación
        </div>

        {RELATIONSHIP_OPTIONS.map((option) => {
          const isSelected = option.value === value;
          const canAccess = canAccessOption(option, userPlan);
          const isLocked = !canAccess;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={cn(
                "flex cursor-pointer items-start gap-3 px-3 py-2.5",
                "focus:bg-white/10 focus:text-white",
                isLocked && "opacity-60",
                isSelected && "bg-white/5"
              )}
            >
              {/* Icon */}
              <span className="mt-0.5 text-lg">{option.icon}</span>

              {/* Content */}
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
                    Solo Premium
                  </p>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}

        {/* Info footer */}
        <div className="mt-1 border-t border-white/10 px-3 py-2 text-xs text-white/40">
          {isPremiumPlan(userPlan) ? (
            <span className="flex items-center gap-1.5">
              <Crown className="h-3 w-3 text-amber-500" />
              Plan Premium activo
            </span>
          ) : (
            <span>Actualiza a Premium para más opciones</span>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        open={showAgeModal}
        onOpenChange={setShowAgeModal}
        onVerified={handleAgeVerified}
      />
    </>
  );
}

export default RelationshipTypeSelector;

