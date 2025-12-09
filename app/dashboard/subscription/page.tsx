"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Crown, Zap, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState<PlanId | null>(null);
  
  // Mapear trial a free para display, pero mostrar badge de trial
  const currentPlan = user?.plan === "trial" ? "free" : (user?.plan as PlanId) || "free";
  const isTrialActive = user?.plan === "trial";

  const handleSelectPlan = async (planId: PlanId) => {
    if (planId === currentPlan && !isTrialActive) return;
    if (planId === "free") return;
    
    setIsLoading(planId);
    // TODO: Implement Stripe checkout
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(null);
    alert(`Stripe checkout para plan ${planId} - Próximamente`);
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

