"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Crown, Zap, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics, AnalyticsEvents } from "@/lib/services/analytics";

type PlanId = "free" | "plus" | "premium";

interface PlanFeature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
  premium: boolean | string;
}

export function SubscriptionContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<PlanId | null>(null);
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'canceled';
    text: string;
  } | null>(null);
  const t = useTranslations("subscriptionPage");
  const locale = useLocale();
  
  const currentPlan = user?.plan === "trial" ? "free" : (user?.plan as PlanId) || "free";
  const isTrialActive = user?.plan === "trial";

  // Plans configuration with translations
  const plans: Record<PlanId, {
    name: string;
    price: string;
    period: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    popular?: boolean;
  }> = {
    free: {
      name: "Free",
      price: "$0",
      period: t("forever"),
      description: t("freePlanDescription"),
      icon: <Zap className="h-6 w-6" />,
      gradient: "from-slate-500 to-slate-600",
    },
    plus: {
      name: "Plus",
      price: "$12.99",
      period: t("perMonth"),
      description: t("plusPlanDescription"),
      icon: <Sparkles className="h-6 w-6" />,
      gradient: "from-primary to-accent",
      popular: true,
    },
    premium: {
      name: "Premium",
      price: "$19.99",
      period: t("perMonth"),
      description: t("premiumPlanDescription"),
      icon: <Crown className="h-6 w-6" />,
      gradient: "from-amber-500 to-orange-500",
    },
  };

  // Features configuration with translations
  const features: PlanFeature[] = [
    { name: t("messagesPerDay"), free: "10", plus: "70", premium: "150" },
    { name: t("accessToLia"), free: true, plus: true, premium: true },
    { name: t("accessToMia"), free: false, plus: true, premium: true },
    { name: t("accessToAllan"), free: false, plus: true, premium: true },
    { name: t("relationFriend"), free: false, plus: true, premium: true },
    { name: t("relationRomantic"), free: false, plus: false, premium: true },
    { name: t("relationAssistant"), free: true, plus: true, premium: true },
    { name: t("conversationMemory"), free: `7 ${t("days")}`, plus: `30 ${t("days")}`, premium: t("unlimited") },
    { name: t("priorityResponses"), free: false, plus: true, premium: true },
    { name: t("prioritySupport"), free: false, plus: false, premium: true },
  ];

  // Helper function for button text
  const getButtonText = (planId: PlanId, isCurrentPlanBtn: boolean, isTrialActiveBtn: boolean) => {
    if (isCurrentPlanBtn && !isTrialActiveBtn) return t("currentPlan");
    if (planId === "free") return t("chooseFree");
    if (isTrialActiveBtn) return `${t("upgradeTo")} ${plans[planId].name}`;
    if (planId === "plus") return t("choosePlus");
    return t("choosePremium"); // premium es el único caso restante
  };

  // Calculate trial days remaining
  const getTrialDaysRemaining = (): number => {
    if (!user?.trial_ends_at) return 0;
    const now = new Date();
    const trialEnd = new Date(user.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setStatusMessage({
        type: 'success',
        text: t("paymentSuccess"),
      });
      // Track checkout completed
      analytics.track(AnalyticsEvents.CHECKOUT_COMPLETED, {
        plan: user?.plan,
      });
      // Limpiar URL params después de mostrar mensaje
      window.history.replaceState({}, '', '/dashboard/subscription');
    } else if (canceled === 'true') {
      setStatusMessage({
        type: 'canceled',
        text: t("paymentCanceled"),
      });
      window.history.replaceState({}, '', '/dashboard/subscription');
    }
  }, [searchParams, t]);

  const handleSelectPlan = async (planId: PlanId) => {
    // No hacer nada si es el plan actual (y no está en trial) o si es free
    if (planId === currentPlan && !isTrialActive) return;
    if (planId === 'free') return;

    setIsLoading(planId);
    setStatusMessage(null); // Limpiar mensajes anteriores

    // Track checkout started
    analytics.track(AnalyticsEvents.CHECKOUT_STARTED, {
      plan: planId,
      price: plans[planId].price,
    });

    try {
      // Determinar la URL base del API
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trynexo.ai';

      // Llamar al backend para crear checkout session
      // Las cookies httpOnly se envían automáticamente con credentials: 'include'
      const response = await fetch(`${apiBaseUrl}/api/v1/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Esto envía las cookies httpOnly automáticamente
        body: JSON.stringify({
          plan: planId,
          success_url: `${window.location.origin}/dashboard/subscription?success=true`,
          cancel_url: `${window.location.origin}/dashboard/subscription?canceled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Manejar error de autenticación específicamente
        if (response.status === 401) {
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }
        
        throw new Error(errorData.detail || 'Error al crear la sesión de pago');
      }

      const data = await response.json();

      // Redirigir a Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No se recibió URL de checkout');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setStatusMessage({
        type: 'error',
        text: error instanceof Error 
          ? error.message 
          : 'Error al iniciar el proceso de pago. Por favor, intenta de nuevo.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "string") {
      return <span className="text-sm font-medium">{value}</span>;
    }
    return value ? (
      <Check className="h-5 w-5 text-primary" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50" />
    );
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-serif">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Status Message Banner */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-primary/20 border border-primary/50 text-primary'
              : statusMessage.type === 'canceled'
              ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
              : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {statusMessage.type === 'canceled' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {statusMessage.type === 'error' && (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-auto text-current hover:opacity-70"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Trial Status Card - Solo visible durante trial activo */}
      {isTrialActive && user?.trial_ends_at && (
        <Card className="mb-8 border-2 border-primary/40 bg-gradient-to-r from-primary/10 via-card to-primary/5 shadow-lg shadow-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left side - Trial info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("trialCardTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("trialCardSubtitle")}
                    </p>
                  </div>
                </div>

                {/* Trial includes list */}
                <div className="mt-4 ml-[52px]">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {t("trialIncludes")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      t("trialIncludesMessages"),
                      t("trialIncludesAllAvatars"),
                      t("trialIncludesAllRelations"),
                      t("trialIncludesMemory"),
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side - Days counter */}
              <div className="flex flex-col items-center md:items-end gap-2 md:min-w-[160px]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {getTrialDaysRemaining()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {getTrialDaysRemaining() === 1
                      ? t("trialDayRemaining")
                      : getTrialDaysRemaining() === 0
                      ? t("trialExpiresToday")
                      : t("trialDaysRemaining")}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full max-w-[200px] h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{
                      width: `${Math.max(5, (getTrialDaysRemaining() / 10) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center md:text-right">
                  {t("trialUpgradeCta")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {(Object.entries(plans) as [PlanId, typeof plans[PlanId]][]).map(([planId, plan]) => {
          const isCurrentPlan = currentPlan === planId && !isTrialActive;
          const isTrialOnFree = isTrialActive && planId === "free";
          const isPopular = plan.popular;

          return (
            <Card
              key={planId}
              className={cn(
                "relative flex flex-col border-2 transition-all duration-300",
                isPopular && "border-primary shadow-lg shadow-primary/20",
                planId === "premium" && !isPopular && "border-amber-500/50 shadow-lg shadow-amber-500/10",
                (isCurrentPlan || isTrialOnFree) && "ring-2 ring-primary",
                !isPopular && planId === "free" && !isCurrentPlan && !isTrialOnFree && "border-slate-500/50",
                !isPopular && planId !== "free" && planId !== "premium" && !isCurrentPlan && !isTrialOnFree && "border-border/50"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white">
                    {t("mostPopular")}
                  </Badge>
                </div>
              )}
              
              {(isCurrentPlan || isTrialOnFree) && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-primary text-white">
                    {isTrialOnFree ? t("trialActiveBadge") : t("currentPlan")}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className={cn(
                  "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br text-white",
                  plan.gradient
                )}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 text-center">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 text-left text-sm">
                  {features.slice(0, 7).map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      {renderFeatureValue(feature[planId])}
                      <span className={cn(
                        "text-muted-foreground",
                        feature.name === t("relationRomantic") && planId === "premium" && "text-amber-400 font-medium"
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    isPopular && "bg-primary hover:bg-primary/80",
                    planId === "premium" && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  )}
                  variant={planId === "free" ? "outline" : "default"}
                  disabled={(isCurrentPlan && !isTrialActive) || isLoading !== null}
                  onClick={() => handleSelectPlan(planId)}
                >
                  {isLoading === planId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    getButtonText(planId, isCurrentPlan, isTrialActive)
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t("featureComparison")}</CardTitle>
          <CardDescription>
            {t("featureComparisonDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-4 text-left font-medium">{t("feature")}</th>
                  <th className="pb-4 text-center font-medium">Free</th>
                  <th className="pb-4 text-center font-medium text-primary">Plus</th>
                  <th className="pb-4 text-center font-medium text-amber-400">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature) => (
                  <tr key={feature.name} className="border-b border-border/30">
                    <td className="py-4 text-sm text-muted-foreground">
                      {feature.name}
                    </td>
                    <td className="py-4 text-center">
                      {renderFeatureValue(feature.free)}
                    </td>
                    <td className="py-4 text-center">
                      {renderFeatureValue(feature.plus)}
                    </td>
                    <td className="py-4 text-center">
                      {renderFeatureValue(feature.premium)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

