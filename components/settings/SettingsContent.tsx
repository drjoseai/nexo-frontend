"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Globe, Trash2, Loader2, Shield, Info, Download, Cookie, CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";
import { clearAllData, exportUserData } from "@/lib/api/chat";
import { analytics, AnalyticsEvents } from "@/lib/services/analytics";
import { useCookieConsent } from "@/lib/hooks/use-cookie-consent";

export function SettingsContent() {
  const { user, logout } = useAuthStore();
  const { resetConsent } = useCookieConsent();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [language, setLanguage] = useState("es");
  const [isManaging, setIsManaging] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      analytics.track(AnalyticsEvents.CLEAR_ALL_DATA);
      toast.success(t("clearAllSuccess") || "All conversations and memories cleared successfully");
    } catch {
      toast.error(t("clearAllError") || "Failed to clear data. Please try again.");
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const blob = await exportUserData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexo-my-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t("exportDataSuccess") || "Your data has been downloaded successfully");
    } catch {
      toast.error(t("exportDataError") || "Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/account`, {
        method: 'DELETE',
        credentials: 'include', // Importante: enviar cookies httpOnly
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 204) {
        // Éxito - cuenta eliminada
        // El backend ya eliminó las cookies, solo hacer logout local
        logout();
      } else if (response.status === 401) {
        // Token inválido o expirado
        toast.error('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        logout();
      } else {
        // Otro error
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Error al eliminar cuenta. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Error de conexión. Por favor verifica tu internet e intenta de nuevo.');
    } finally {
      setIsDeleting(false);
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
          return_url: `${window.location.origin}/dashboard/settings`,
        }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al gestionar suscripción');
      }
      const data = await response.json();
      if (data.portal_url) {
        window.location.href = data.portal_url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al gestionar suscripción');
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
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error al cancelar suscripción');
      }
      toast.success(t("cancelSubscriptionSuccess") || 'Tu suscripción se cancelará al final del período de facturación');
      setShowCancelDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cancelar suscripción');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Data & Privacy */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("dataPrivacy")}
            </CardTitle>
            <CardDescription>
              {t("dataPrivacyDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("termsOfService")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("termsOfServiceDescription")}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  {t("view")}
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("privacyPolicy")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("privacyPolicyDescription")}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  {t("view")}
                </a>
              </Button>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
              <p className="text-xs text-muted-foreground">
                🔒 {t("dataEncryptionNotice")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              {t("language")}
            </CardTitle>
            <CardDescription>
              {t("languageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("preferredLanguage")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("languageDescription")}
                </p>
              </div>
              <Select
                value={language}
                onValueChange={(value) => setLanguage(value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* About NEXO */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              {t("aboutNexo")}
            </CardTitle>
            <CardDescription>
              {t("aboutNexoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("version")}</span>
              <span className="text-sm font-medium">v2.0 Beta</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("support")}</span>
              <a href="mailto:info@trynexo.ai" className="text-sm font-medium text-primary hover:underline">
                info@trynexo.ai
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("madeBy")}</span>
              <span className="text-sm font-medium">VENKO AI INNOVATIONS LLC</span>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Preferences */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              {t("cookiePreferences")}
            </CardTitle>
            <CardDescription>
              {t("cookiePreferencesDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("cookiePreferences")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("cookiePreferencesDescription")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetConsent();
                  toast.success(t("cookiePreferencesReset"));
                }}
              >
                {t("resetCookiePreferences")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management - Solo para usuarios de pago */}
        {(user?.plan === "plus" || user?.plan === "premium") && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {t("subscriptionManagement") || "Subscription"}
              </CardTitle>
              <CardDescription>
                {t("subscriptionManagementDescription") || "Manage your subscription and payments"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
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
                  {t("managePayments") || "Manage payments"}
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
                  {t("cancelSubscription") || "Cancel subscription"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              {t("dangerZone")}
            </CardTitle>
            <CardDescription>
              {t("dangerZoneDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Clear All Data */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-red-500/20">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("clearAllTitle") || "Clear All Conversations & Memory"}</p>
                <p className="text-xs text-muted-foreground">{t("clearAllDescription") || "Delete all messages, memories, and conversation history. Your account and subscription will be kept."}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    disabled={isClearing}
                  >
                    {isClearing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t("clearing") || "Clearing..."}
                      </>
                    ) : (
                      t("clearAllButton") || "Clear All Data"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("clearAllConfirmTitle") || "Are you absolutely sure?"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("clearAllConfirmDescription") || "This will permanently delete all your conversations, messages, and memories with all avatars. They will forget everything about you. This action cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10">{t("cancel") || "Cancel"}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isClearing}
                    >
                      {t("clearAllConfirmButton") || "Yes, clear everything"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Export My Data (GDPR) */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("exportDataTitle") || "Export My Data"}</p>
                <p className="text-xs text-muted-foreground">{t("exportDataDescription") || "Download all your data including profile, conversations, and memories as a JSON file."}</p>
              </div>
              <Button
                variant="outline"
                className="border-white/20 hover:bg-white/5"
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t("exporting") || "Exporting..."}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t("exportDataButton") || "Download"}
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">{t("deleteAccount")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("deleteAccountDescription")}
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    {t("deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteAccountConfirmTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteAccountConfirmDescription")}
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        <li>{t("deleteAccountItem1")}</li>
                        <li>{t("deleteAccountItem2")}</li>
                        <li>{t("deleteAccountItem3")}</li>
                        <li>{t("deleteAccountItem4")}</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      {t("deleteAccountConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Subscription Dialog */}
      {(user?.plan === "plus" || user?.plan === "premium") && (
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("cancelSubscriptionConfirmTitle") || "Cancel subscription?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("cancelSubscriptionConfirmDescription") || "Your subscription will remain active until the end of your current billing period. After that, you'll be downgraded to the Free plan."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("keepSubscription") || "Keep subscription"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelSubscription}
                className="bg-red-600 hover:bg-red-700"
                disabled={isCanceling}
              >
                {isCanceling ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("confirmCancelSubscription") || "Yes, cancel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
