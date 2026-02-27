"use client";

/**
 * Reset Password Page for NEXO v2.0
 * 
 * Allows users to set a new password using a reset token
 * 
 * @module app/(auth)/reset-password/page
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

const createResetPasswordSchema = (t: (key: string) => string) =>
  z.object({
    new_password: z
      .string()
      .min(8, t("passwordMinLength"))
      .max(100, t("passwordMaxLength")),
    confirm_password: z
      .string()
      .min(1, t("confirmPasswordRequired")),
  }).refine((data) => data.new_password === data.confirm_password, {
    message: t("passwordsMustMatch"),
    path: ["confirm_password"],
  });

type ResetPasswordFormData = z.infer<ReturnType<typeof createResetPasswordSchema>>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error(t("resetPasswordInvalidToken"));
      router.push("/forgot-password");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, router, t]);

  const resetPasswordSchema = createResetPasswordSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.trynexo.ai";
      const response = await fetch(`${apiUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          new_password: data.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Reset failed");
      }

      setIsSuccess(true);
      toast.success(t("resetPasswordSuccess"));
    } catch (error: unknown) {
      const errorMessage = 
        (error as Error)?.message || t("resetPasswordError");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full" data-testid="reset-password-card">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("resetPasswordSuccessTitle")}</CardTitle>
          <CardDescription>
            {t("resetPasswordSuccessDescription")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full" size="lg" data-testid="reset-password-go-to-login">
              {t("login")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (!token) return null;

  return (
    <Card className="w-full" data-testid="reset-password-card">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          <div className="text-4xl font-bold text-gradient font-serif">
            NEXO
          </div>
        </div>
        <CardTitle className="text-2xl">{t("resetPasswordTitle")}</CardTitle>
        <CardDescription>
          {t("resetPasswordDescription")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} data-testid="reset-password-form">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">{t("newPassword")}</Label>
            <Input
              id="new_password"
              data-testid="reset-password-new"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.new_password}
              disabled={isLoading}
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="text-sm text-destructive" data-testid="reset-password-new-error">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
            <Input
              id="confirm_password"
              data-testid="reset-password-confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              disabled={isLoading}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive" data-testid="reset-password-confirm-error">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            data-testid="reset-password-submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? t("resetting") : t("resetPasswordSubmit")}
          </Button>

          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            data-testid="reset-password-back-link"
          >
            <ArrowLeft className="w-3 h-3" />
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
