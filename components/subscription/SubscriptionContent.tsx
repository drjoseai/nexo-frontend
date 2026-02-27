"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Crown, Zap, Star, Loader2, CreditCard, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isManaging, setIsManaging] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isBoostLoading, setIsBoostLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const t = useTranslations("subscriptionPage");
  
  const currentPlan = user?.plan === "trial" ? "free" : (user?.plan as PlanId) || "free";
  const isTrialActive = user?.plan === "trial";

  // Plan Status Card configuration
  const planStatusConfig = (() => {
    const plan = user?.plan || "free";
    
    if (plan === "trial") {
      return {
        type: "trial" as const,
        title: t("trialCardTitle"),
        subtitle: t("trialCardSubtitle"),
        icon: <Star className="h-5 w-5 text-primary" />,
        iconBg: "bg-primary/20",
        borderColor: "border-primary/40",
        gradient: "from-primary/10 via-card to-primary/5",
        shadowColor: "shadow-primary/10",
        includes: [
          t("trialIncludesMessages"),
          t("trialIncludesAllAvatars"),
          t("trialIncludesAllRelations"),
          t("trialIncludesMemory"),
        ],
        includesLabel: t("trialIncludes"),
        cta: t("trialUpgradeCta"),
        ctaAction: null as PlanId | null,
        badge: null as string | null,
        checkColor: "text-primary",
      };
    }
    
    if (plan === "plus") {
      return {
        type: "plus" as const,
        title: t("planStatusPlusTitle"),
        subtitle: t("planStatusPlusSubtitle"),
        icon: <Sparkles className="h-5 w-5 text-primary" />,
        iconBg: "bg-primary/20",
        borderColor: "border-primary/30",
        gradient: "from-primary/10 via-card to-accent/5",
        shadowColor: "shadow-primary/10",
        includes: [
          t("planStatusPlusMessages"),
          t("planStatusPlusAvatars"),
          t("planStatusPlusRelations"),
          t("planStatusPlusMemory"),
        ],
        includesLabel: t("planStatusPlusIncludes"),
        cta: t("planStatusPlusCta"),
        ctaAction: "premium" as PlanId | null,
        badge: null as string | null,
        checkColor: "text-primary",
      };
    }
    
    if (plan === "premium") {
      return {
        type: "premium" as const,
        title: t("planStatusPremiumTitle"),
        subtitle: t("planStatusPremiumSubtitle"),
        icon: <Crown className="h-5 w-5 text-amber-400" />,
        iconBg: "bg-amber-500/20",
        borderColor: "border-amber-500/30",
        gradient: "from-amber-500/10 via-card to-orange-500/5",
        shadowColor: "shadow-amber-500/10",
        includes: [
          t("planStatusPremiumMessages"),
          t("planStatusPremiumAvatars"),
          t("planStatusPremiumRelations"),
          t("planStatusPremiumMemory"),
          t("planStatusPremiumSupport"),
          t("premiumBoostInfo"),
        ],
        includesLabel: t("planStatusPremiumIncludes"),
        cta: null as string | null,
        ctaAction: null as PlanId | null,
        badge: t("planStatusPremiumBadge"),
        checkColor: "text-amber-400",
      };
    }
    
    // Default: free
    return {
      type: "free" as const,
      title: t("planStatusFreeTitle"),
      subtitle: t("planStatusFreeSubtitle"),
      icon: <Zap className="h-5 w-5 text-muted-foreground" />,
      iconBg: "bg-muted",
      borderColor: "border-border",
      gradient: "from-muted/30 via-card to-muted/10",
      shadowColor: "shadow-none",
      includes: [
        t("planStatusFreeMessages"),
        t("planStatusFreeAvatars"),
        t("planStatusFreeRelations"),
        t("planStatusFreeMemory"),
      ],
      includesLabel: t("planStatusFreeIncludes"),
      cta: t("planStatusFreeCta"),
      ctaAction: "plus" as PlanId | null,
      badge: null as string | null,
      checkColor: "text-muted-foreground",
    };
  })();

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
      price: "$9.99",
      period: t("perMonth"),
      description: t("plusPlanDescription"),
      icon: <Sparkles className="h-6 w-6" />,
      gradient: "from-primary to-accent",
      popular: true,
    },
    premium: {
      name: "Premium",
      price: "$12.99",
      period: t("perMonth"),
      description: t("premiumPlanDescription"),
      icon: <Crown className="h-6 w-6" />,
      gradient: "from-amber-500 to-orange-500",
    },
  };

  // Features configuration with translations
  const features: PlanFeature[] = [
    { name: t("messagesPerDay"), free: "10", plus: "120", premium: "150 ✦" },
    { name: t("accessToLia"), free: true, plus: true, premium: true },
    { name: t("accessToMia"), free: false, plus: true, premium: true },
    { name: t("accessToAllan"), free: false, plus: true, premium: true },
    { name: t("relationFriend"), free: false, plus: true, premium: true },
    { name: t("relationRomantic"), free: false, plus: false, premium: true },
    { name: t("relationAssistant"), free: true, plus: true, premium: true },
    { name: t("conversationMemory"), free: `7 ${t("days")}`, plus: `90 ${t("days")}`, premium: t("unlimited") },
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
      // Track checkout completed - retry to ensure Mixpanel is initialized
      const trackCheckout = () => {
        analytics.track(AnalyticsEvents.CHECKOUT_COMPLETED, {
          plan: user?.plan,
          source: 'stripe_redirect',
        });
      };
      trackCheckout();
      setTimeout(trackCheckout, 2000);
      // Limpiar URL params después de mostrar mensaje
      window.history.replaceState({}, '', '/dashboard/subscription');
    } else if (canceled === 'true') {
      setStatusMessage({
        type: 'canceled',
        text: t("paymentCanceled"),
      });
      window.history.replaceState({}, '', '/dashboard/subscription');
    }

    const boostStatus = searchParams.get('boost');
    if (boostStatus === 'success') {
      setStatusMessage({
        type: 'success',
        text: t("boostPurchaseSuccess"),
      });
      const { loadUser } = useAuthStore.getState();
      loadUser();
      window.history.replaceState({}, '', '/dashboard/subscription');
    } else if (boostStatus === 'cancelled') {
      setStatusMessage({
        type: 'canceled',
        text: t("boostPurchaseCanceled"),
      });
      window.history.replaceState({}, '', '/dashboard/subscription');
    }
  }, [searchParams, t, user?.plan]);

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

      if (data.action === 'checkout' && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else if (data.action === 'upgrade' || data.action === 'downgrade' || data.action === 'reactivated') {
        setStatusMessage({
          type: 'success',
          text: data.message || `Plan changed to ${data.new_plan} successfully!`,
        });
        const { loadUser } = useAuthStore.getState();
        await loadUser();
      } else if (data.checkout_url) {
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

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trynexo.ai';
      const response = await fetch(`${apiBaseUrl}/api/v1/stripe/customer-portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          return_url: `${window.location.origin}/dashboard/subscription`,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("sessionExpired"));
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t("errorManaging"));
      }

      const data = await response.json();
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t("errorManaging"),
      });
    } finally {
      setIsManaging(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCanceling(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trynexo.ai';
      const response = await fetch(`${apiBaseUrl}/api/v1/stripe/cancel-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ immediate: false }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("sessionExpired"));
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t("errorCanceling"));
      }

      const data = await response.json();
      setStatusMessage({
        type: 'success',
        text: data.message || t("cancelSuccess"),
      });
      analytics.track(AnalyticsEvents.SUBSCRIPTION_CANCELED, {
        plan: currentPlan,
      });
      setShowCancelDialog(false);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : t("errorCanceling"),
      });
    } finally {
      setIsCanceling(false);
    }
  };

  const handlePurchaseBoost = async () => {
    setIsBoostLoading(true);
    setStatusMessage(null);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.trynexo.ai';
      const response = await fetch(`${apiBaseUrl}/api/v1/stripe/purchase-boost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          success_url: `${window.location.origin}/dashboard/subscription?boost=success`,
          cancel_url: `${window.location.origin}/dashboard/subscription?boost=cancelled`,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t("sessionExpired"));
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error initiating boost purchase');
      }

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Boost purchase error:', error);
      setStatusMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Error initiating boost purchase',
      });
    } finally {
      setIsBoostLoading(false);
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

      {/* Plan Status Card - Visible para todos los planes */}
      <Card className={cn(
        "mb-8 border-2 bg-gradient-to-r shadow-lg",
        planStatusConfig.borderColor,
        planStatusConfig.gradient,
        planStatusConfig.shadowColor
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left side - Plan info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  planStatusConfig.iconBg
                )}>
                  {planStatusConfig.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {planStatusConfig.title}
                    </h3>
                    {planStatusConfig.badge && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        {planStatusConfig.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {planStatusConfig.subtitle}
                  </p>
                </div>
              </div>

              {/* Plan includes list */}
              <div className="mt-4 ml-[52px]">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  {planStatusConfig.includesLabel}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {planStatusConfig.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className={cn("h-3.5 w-3.5 flex-shrink-0", planStatusConfig.checkColor)} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side - Trial counter OR CTA */}
            <div className="flex flex-col items-center md:items-end gap-2 md:min-w-[160px]">
              {planStatusConfig.type === "trial" && user?.trial_ends_at ? (
                <>
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
                  <div className="w-full max-w-[200px] h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{
                        width: `${Math.max(5, (getTrialDaysRemaining() / 10) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center md:text-right">
                    {planStatusConfig.cta}
                  </p>
                </>
              ) : planStatusConfig.cta ? (
                <Button
                  variant={planStatusConfig.type === "free" ? "outline" : "default"}
                  className={cn(
                    "whitespace-nowrap",
                    planStatusConfig.type === "plus" && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  )}
                  onClick={() => {
                    if (planStatusConfig.ctaAction) {
                      handleSelectPlan(planStatusConfig.ctaAction);
                    }
                  }}
                  disabled={isLoading !== null}
                >
                  {isLoading === planStatusConfig.ctaAction ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    planStatusConfig.cta
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          {/* Boost Purchase Button - Only for Premium */}
          {user?.plan === "premium" && (
            <div className="w-full mt-4 pt-4 border-t border-amber-500/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-amber-400/80">
                  <Zap className="h-4 w-4" />
                  <span>{t("boostPromo")}</span>
                </div>
                <Button
                  onClick={handlePurchaseBoost}
                  disabled={isBoostLoading}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold gap-2 whitespace-nowrap"
                  size="sm"
                >
                  {isBoostLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("buyBoostButton")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Subscription - Solo para usuarios de pago */}
      {(user?.plan === "plus" || user?.plan === "premium") && (
        <div className="mb-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleManageSubscription}
            disabled={isManaging}
            className="gap-2"
          >
            {isManaging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {t("managePayments")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCancelDialog(true)}
            disabled={isCanceling}
            className="gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
          >
            {isCanceling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {t("cancelSubscription")}
          </Button>
        </div>
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

                {planId === "premium" && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400/90 font-medium mb-1">
                      ✦ {t("premiumMessagesBreakdown")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      🚀 {t("boostDescription")}
                    </p>
                  </div>
                )}
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

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("cancelConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("keepSubscription")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700"
              disabled={isCanceling}
            >
              {isCanceling ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("confirmCancel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

