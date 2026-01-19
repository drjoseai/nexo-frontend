"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
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

const FEATURES: PlanFeature[] = [
  { name: "Mensajes por día", free: "5", plus: "100", premium: "Ilimitados" },
  { name: "Acceso a Lía", free: true, plus: true, premium: true },
  { name: "Acceso a Mía", free: false, plus: true, premium: true },
  { name: "Acceso a Allan", free: false, plus: true, premium: true },
  { name: "Relación: Assistant", free: true, plus: true, premium: true },
  { name: "Relación: Friend", free: false, plus: true, premium: true },
  { name: "Relación: Romantic (18+)", free: false, plus: false, premium: true },
  { name: "Memoria de conversaciones", free: "7 días", plus: "30 días", premium: "Ilimitada" },
  { name: "Respuestas prioritarias", free: false, plus: true, premium: true },
  { name: "Soporte prioritario", free: false, plus: false, premium: true },
];

const PLANS: Record<PlanId, {
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
    period: "para siempre",
    description: "Perfecto para conocer NEXO",
    icon: <Zap className="h-6 w-6" />,
    gradient: "from-slate-500 to-slate-600",
  },
  plus: {
    name: "Plus",
    price: "$9.99",
    period: "/mes",
    description: "Desbloquea todos los avatares",
    icon: <Sparkles className="h-6 w-6" />,
    gradient: "from-purple-500 to-pink-500",
    popular: true,
  },
  premium: {
    name: "Premium",
    price: "$14.99",
    period: "/mes",
    description: "La experiencia completa de NEXO",
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-amber-500 to-orange-500",
  },
};

export function SubscriptionContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<PlanId | null>(null);
  const searchParams = useSearchParams();
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'canceled';
    text: string;
  } | null>(null);
  
  const currentPlan = user?.plan === "trial" ? "free" : (user?.plan as PlanId) || "free";
  const isTrialActive = user?.plan === "trial";

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      setStatusMessage({
        type: 'success',
        text: '¡Pago completado exitosamente! Tu plan ha sido actualizado.',
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
        text: 'El proceso de pago fue cancelado. Puedes intentar de nuevo cuando quieras.',
      });
      window.history.replaceState({}, '', '/dashboard/subscription');
    }
  }, [searchParams]);

  const handleSelectPlan = async (planId: PlanId) => {
    // No hacer nada si es el plan actual (y no está en trial) o si es free
    if (planId === currentPlan && !isTrialActive) return;
    if (planId === 'free') return;

    setIsLoading(planId);
    setStatusMessage(null); // Limpiar mensajes anteriores

    // Track checkout started
    analytics.track(AnalyticsEvents.CHECKOUT_STARTED, {
      plan: planId,
      price: PLANS[planId].price,
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
      <Check className="h-5 w-5 text-green-400" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50" />
    );
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Planes y Precios</h1>
        <p className="mt-2 text-muted-foreground">
          Elige el plan perfecto para tu experiencia con NEXO
        </p>
        {isTrialActive && user?.trial_ends_at && (
          <Badge className="mt-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Star className="h-3 w-3 mr-1" />
            Trial activo hasta {new Date(user.trial_ends_at).toLocaleDateString("es-ES")}
          </Badge>
        )}
      </div>

      {/* Status Message Banner */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-green-500/20 border border-green-500/50 text-green-400'
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

      {/* Plan Cards */}
      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {(Object.entries(PLANS) as [PlanId, typeof PLANS[PlanId]][]).map(([planId, plan]) => {
          const isCurrentPlan = currentPlan === planId && !isTrialActive;
          const isTrialOnFree = isTrialActive && planId === "free";
          const isPopular = plan.popular;

          return (
            <Card
              key={planId}
              className={cn(
                "relative flex flex-col border-2 transition-all duration-300",
                isPopular && "border-purple-500 shadow-lg shadow-purple-500/20",
                (isCurrentPlan || isTrialOnFree) && "ring-2 ring-green-500",
                !isPopular && !isCurrentPlan && !isTrialOnFree && "border-border/50"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">
                    Más Popular
                  </Badge>
                </div>
              )}
              
              {(isCurrentPlan || isTrialOnFree) && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">
                    {isTrialOnFree ? "Trial Activo" : "Plan Actual"}
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
                  {FEATURES.slice(0, 6).map((feature) => (
                    <li key={feature.name} className="flex items-center gap-2">
                      {renderFeatureValue(feature[planId])}
                      <span className="text-muted-foreground">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    isPopular && "bg-purple-600 hover:bg-purple-700",
                    planId === "premium" && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  )}
                  variant={planId === "free" ? "outline" : "default"}
                  disabled={(isCurrentPlan && !isTrialActive) || isLoading !== null}
                  onClick={() => handleSelectPlan(planId)}
                >
                  {isLoading === planId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrentPlan && !isTrialActive ? (
                    "Plan Actual"
                  ) : planId === "free" ? (
                    "Plan Gratuito"
                  ) : isTrialActive ? (
                    `Actualizar a ${plan.name}`
                  ) : (
                    `Elegir ${plan.name}`
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
          <CardTitle>Comparación de Características</CardTitle>
          <CardDescription>
            Todas las características disponibles en cada plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-4 text-left font-medium">Característica</th>
                  <th className="pb-4 text-center font-medium">Free</th>
                  <th className="pb-4 text-center font-medium text-purple-400">Plus</th>
                  <th className="pb-4 text-center font-medium text-amber-400">Premium</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature) => (
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

