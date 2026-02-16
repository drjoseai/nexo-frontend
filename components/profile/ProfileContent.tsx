"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgeVerificationModal } from "@/components/chat/AgeVerificationModal";
import { toast } from "sonner";

export function ProfileContent() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.display_name || user?.email?.split("@")[0] || "",
  });
  const [showAgeModal, setShowAgeModal] = useState(false);

  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "premium":
        return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
      case "plus":
        return "bg-gradient-to-r from-primary to-accent text-white";
      case "trial":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("notAvailable");
    return new Date(dateString).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  {t("personalInfo")}
                </CardTitle>
                <CardDescription>
                  {t("personalInfoDescription")}
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  {t("edit")}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/80"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="ml-2">{t("save")}</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {user.display_name || user.email?.split("@")[0]}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">{t("displayName")}</Label>
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder={t("displayNamePlaceholder")}
                  />
                ) : (
                  <p className="flex h-10 items-center text-sm">
                    {user.display_name || t("notSet")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="flex h-10 items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("subscription")}
            </CardTitle>
            <CardDescription>
              {t("subscriptionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">{t("currentPlan")}</span>
                  <Badge className={cn("text-sm", getPlanBadgeColor(user.plan || "free"))}>
                    {(user.plan || "free").toUpperCase()}
                  </Badge>
                </div>
                {user.plan === "trial" && user.trial_ends_at && (
                  <p className="text-sm text-muted-foreground">
                    {t("trialEnds")} {formatDate(user.trial_ends_at)}
                  </p>
                )}
                {(user.plan === "plus" || user.plan === "premium") && user.subscription_ends_at && (
                  <p className="text-sm text-muted-foreground">
                    {t("nextRenewal")} {formatDate(user.subscription_ends_at)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="border-primary/30 hover:bg-primary/10"
                onClick={() => window.location.href = "/dashboard/subscription"}
              >
                {t("viewPlans")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {t("accountInfo")}
            </CardTitle>
            <CardDescription>
              {t("accountInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">{t("accountCreated")}</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("ageVerification")}</p>
                  <p className="font-medium">
                    {user.age_verified ? (
                      <span className="text-primary">{t("verified18")}</span>
                    ) : (
                      <span className="text-muted-foreground">{t("notVerified")}</span>
                    )}
                  </p>
                </div>
                {!user.age_verified && (
                  <Button
                    size="sm"
                    onClick={() => setShowAgeModal(true)}
                    className="bg-primary hover:bg-primary/80"
                  >
                    {t("verifyAge")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Age Verification Modal */}
      <AgeVerificationModal
        open={showAgeModal}
        onOpenChange={setShowAgeModal}
        onVerified={async () => {
          // Reload user data
          const { loadUser } = useAuthStore.getState();
          await loadUser();
          toast.success(t("ageVerifiedSuccess"));
        }}
      />
    </div>
  );
}

