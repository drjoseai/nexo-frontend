"use client";

/**
 * Onboarding Page for NEXO v2.0
 * 
 * Multi-step wizard that collects user profile data to personalize
 * avatar conversations from the first message.
 * 
 * Steps:
 * 1. Name & Language
 * 2. About You (location, profession, age range)
 * 3. Interests & Style
 * 4. What you're looking for
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { saveOnboardingProfile, type OnboardingProfile } from "@/lib/api/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// Constants
// ============================================

const INTEREST_OPTIONS = [
  { id: "music", label: { es: "🎵 Música", en: "🎵 Music" } },
  { id: "movies", label: { es: "🎬 Películas/Series", en: "🎬 Movies/TV" } },
  { id: "travel", label: { es: "✈️ Viajes", en: "✈️ Travel" } },
  { id: "technology", label: { es: "💻 Tecnología", en: "💻 Technology" } },
  { id: "sports", label: { es: "⚽ Deportes", en: "⚽ Sports" } },
  { id: "cooking", label: { es: "🍳 Cocina", en: "🍳 Cooking" } },
  { id: "reading", label: { es: "📚 Lectura", en: "📚 Reading" } },
  { id: "gaming", label: { es: "🎮 Videojuegos", en: "🎮 Gaming" } },
  { id: "fitness", label: { es: "💪 Fitness", en: "💪 Fitness" } },
  { id: "art", label: { es: "🎨 Arte", en: "🎨 Art" } },
  { id: "nature", label: { es: "🌿 Naturaleza", en: "🌿 Nature" } },
  { id: "science", label: { es: "🔬 Ciencia", en: "🔬 Science" } },
];

const LOOKING_FOR_OPTIONS = [
  { id: "companionship", label: { es: "💬 Compañía y conversación", en: "💬 Companionship & chat" } },
  { id: "emotional_support", label: { es: "💛 Apoyo emocional", en: "💛 Emotional support" } },
  { id: "fun", label: { es: "😄 Diversión y risas", en: "😄 Fun & laughs" } },
  { id: "advice", label: { es: "🧠 Consejos y perspectiva", en: "🧠 Advice & perspective" } },
  { id: "romance", label: { es: "❤️ Conexión romántica", en: "❤️ Romantic connection" } },
  { id: "friendship", label: { es: "🤝 Amistad genuina", en: "🤝 Genuine friendship" } },
];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;

const COMMUNICATION_STYLES = [
  { id: "casual", label: { es: "😊 Casual y relajado", en: "😊 Casual & relaxed" } },
  { id: "balanced", label: { es: "⚖️ Equilibrado", en: "⚖️ Balanced" } },
  { id: "formal", label: { es: "👔 Más formal", en: "👔 More formal" } },
] as const;

// ============================================
// Types
// ============================================

interface OnboardingData {
  name: string;
  preferred_language: "es" | "en";
  location: string;
  profession: string;
  age_range: string;
  interests: string[];
  communication_style: string;
  looking_for: string[];
}

const TOTAL_STEPS = 4;

const ONBOARDING_STORAGE_KEY = "nexo_onboarding_progress";

// ============================================
// SessionStorage Helpers
// ============================================

function loadProgress(): { step: number; data: OnboardingData } | null {
  try {
    if (typeof window === "undefined") return null;
    const saved = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function saveProgress(step: number, data: OnboardingData): void {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify({ step, data }));
  } catch {
    // Silently fail — not critical
  }
}

function clearProgress(): void {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

// ============================================
// Main Component
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, loadUser } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    name: "",
    preferred_language: "es",
    location: "",
    profession: "",
    age_range: "",
    interests: [],
    communication_style: "",
    looking_for: [],
  });

  // Initialize with user data if available
  useEffect(() => {
    if (user) {
      setData(prev => ({
        ...prev,
        name: user.display_name || "",
        preferred_language: user.preferred_language || "es",
      }));
    }
  }, [user]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // If already completed onboarding, redirect to dashboard
  useEffect(() => {
    if (user?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Restore saved progress from sessionStorage
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setData(saved.data);
      setCurrentStep(saved.step);
    }
  }, []);

  // Persist progress to sessionStorage
  useEffect(() => {
    saveProgress(currentStep, data);
  }, [currentStep, data]);

  // Shorthand for current language
  const lang = data.preferred_language;

  // ============================================
  // Handlers
  // ============================================

  const updateField = (field: keyof OnboardingData, value: string | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: "interests" | "looking_for", item: string) => {
    setData(prev => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length >= 2;
      case 2:
        return true; // All optional
      case 3:
        return true; // All optional
      case 4:
        return true; // All optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (data.name.trim().length < 2) {
      toast.error(lang === "es" ? "Tu nombre debe tener al menos 2 caracteres" : "Your name must be at least 2 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const profile: OnboardingProfile = {
        name: data.name.trim(),
        preferred_language: data.preferred_language,
        ...(data.location && { location: data.location }),
        ...(data.profession && { profession: data.profession }),
        ...(data.age_range && { age_range: data.age_range as OnboardingProfile["age_range"] }),
        ...(data.interests.length > 0 && { interests: data.interests }),
        ...(data.communication_style && { communication_style: data.communication_style as OnboardingProfile["communication_style"] }),
        ...(data.looking_for.length > 0 && { looking_for: data.looking_for as OnboardingProfile["looking_for"] }),
      };

      await saveOnboardingProfile(profile);
      
      // Reload user to get updated onboarding_completed flag
      await loadUser();
      
      toast.success(
        lang === "es" ? "¡Perfil guardado! Tus avatares ya te conocen 🎉" : "Profile saved! Your avatars know you now 🎉"
      );
      
      clearProgress();
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding save error:", error);
      toast.error(
        lang === "es" ? "Error al guardar perfil. Intenta de nuevo." : "Error saving profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    // Even when skipping, save the name and language if provided
    setIsSubmitting(true);
    try {
      const profile: OnboardingProfile = {
        name: data.name.trim() || user?.display_name || user?.email?.split("@")[0] || "User",
        preferred_language: data.preferred_language,
      };

      await saveOnboardingProfile(profile);
      await loadUser();
      
      clearProgress();
      router.push("/dashboard");
    } catch (error) {
      // If skip fails, just go to dashboard anyway
      console.error("Skip onboarding error:", error);
      clearProgress();
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // Loading / Auth states
  // ============================================

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ============================================
  // Render
  // ============================================

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-lg">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gradient mb-2 font-serif">
            NEXO
          </div>
          <p className="text-muted-foreground text-sm">
            {lang === "es" ? "Cuéntanos sobre ti para personalizar tu experiencia" : "Tell us about yourself to personalize your experience"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i < currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm min-h-[350px] flex flex-col">
          
          {/* ========== STEP 1: Name & Language ========== */}
          {currentStep === 1 && (
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {lang === "es" ? "¡Hola! 👋" : "Hello! 👋"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {lang === "es" 
                    ? "¿Cómo te gustaría que te llamen tus avatares?" 
                    : "What should your avatars call you?"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">
                  {lang === "es" ? "Tu nombre" : "Your name"}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={lang === "es" ? "Ej: Carlos, Ana, Alex..." : "E.g.: Carlos, Ana, Alex..."}
                  value={data.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  maxLength={100}
                  autoFocus
                  className="text-lg"
                />
                {data.name.trim().length === 1 && (
                  <p className="text-xs text-amber-500">
                    {lang === "es" ? "Mínimo 2 caracteres" : "Minimum 2 characters"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{lang === "es" ? "Idioma preferido" : "Preferred language"}</Label>
                <div className="flex gap-3">
                  {[
                    { code: "es" as const, label: "🇪🇸 Español" },
                    { code: "en" as const, label: "🇺🇸 English" },
                  ].map(({ code, label }) => (
                    <button
                      key={code}
                      onClick={() => updateField("preferred_language", code)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all",
                        data.preferred_language === code
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== STEP 2: About You ========== */}
          {currentStep === 2 && (
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {lang === "es" ? `Cuéntanos sobre ti, ${data.name}` : `Tell us about yourself, ${data.name}`}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {lang === "es" ? "Todo es opcional — comparte lo que quieras" : "Everything is optional — share what you'd like"}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    {lang === "es" ? "📍 ¿De dónde eres?" : "📍 Where are you from?"}
                  </Label>
                  <Input
                    id="location"
                    placeholder={lang === "es" ? "Ej: México, Colombia, Madrid..." : "E.g.: Miami, London, Tokyo..."}
                    value={data.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profession">
                    {lang === "es" ? "💼 ¿A qué te dedicas?" : "💼 What do you do?"}
                  </Label>
                  <Input
                    id="profession"
                    placeholder={lang === "es" ? "Ej: Estudiante, Ingeniera, Chef..." : "E.g.: Student, Engineer, Chef..."}
                    value={data.profession}
                    onChange={(e) => updateField("profession", e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{lang === "es" ? "🎂 Rango de edad" : "🎂 Age range"}</Label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => updateField("age_range", data.age_range === range ? "" : range)}
                        className={cn(
                          "px-4 py-2 rounded-lg border text-sm transition-all",
                          data.age_range === range
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== STEP 3: Interests & Style ========== */}
          {currentStep === 3 && (
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {lang === "es" ? "¿Qué te apasiona?" : "What are you passionate about?"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {lang === "es" ? "Selecciona los que más te gusten" : "Pick the ones you like most"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleArrayItem("interests", id)}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm transition-all",
                      data.interests.includes(id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {label[lang]}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>{lang === "es" ? "¿Cómo prefieres que te hablen?" : "How do you prefer to be spoken to?"}</Label>
                <div className="flex flex-col gap-2">
                  {COMMUNICATION_STYLES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => updateField("communication_style", data.communication_style === id ? "" : id)}
                      className={cn(
                        "px-4 py-3 rounded-lg border text-sm text-left transition-all",
                        data.communication_style === id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {label[lang]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== STEP 4: What you're looking for ========== */}
          {currentStep === 4 && (
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {lang === "es" ? "¿Qué buscas en NEXO?" : "What are you looking for in NEXO?"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {lang === "es" ? "Puedes elegir varios" : "You can pick multiple"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {LOOKING_FOR_OPTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleArrayItem("looking_for", id)}
                    className={cn(
                      "px-4 py-3 rounded-lg border text-sm text-left transition-all flex items-center justify-between",
                      data.looking_for.includes(id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span>{label[lang]}</span>
                    {data.looking_for.includes(id) && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========== Navigation Buttons ========== */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            {/* Left side */}
            <div>
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {lang === "es" ? "Atrás" : "Back"}
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting} className="text-muted-foreground">
                  {lang === "es" ? "Omitir" : "Skip"}
                </Button>
              )}
            </div>

            {/* Right side */}
            <div>
              {currentStep < TOTAL_STEPS ? (
                <Button onClick={handleNext} disabled={!canProceed() || isSubmitting}>
                  {lang === "es" ? "Siguiente" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isSubmitting
                    ? (lang === "es" ? "Guardando..." : "Saving...")
                    : (lang === "es" ? "¡Empezar!" : "Let's go!")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step indicator text */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {lang === "es" ? `Paso ${currentStep} de ${TOTAL_STEPS}` : `Step ${currentStep} of ${TOTAL_STEPS}`}
        </p>
      </div>
    </div>
  );
}
