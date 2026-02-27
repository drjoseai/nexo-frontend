"use client";

/**
 * Forgot Password Page for NEXO v2.0
 * 
 * Allows users to request a password reset email
 * 
 * @module app/(auth)/forgot-password/page
 */

import { useState } from "react";
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
import { ArrowLeft, Mail } from "lucide-react";

const createForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .email(t("emailInvalid")),
  });

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordSchema = createForgotPasswordSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.trynexo.ai";
      const response = await fetch(
        `${apiUrl}/api/v1/auth/forgot-password?email=${encodeURIComponent(data.email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setEmailSent(true);
      toast.success(t("forgotPasswordEmailSent"));
    } catch {
      // Always show success to avoid email enumeration
      setEmailSent(true);
      toast.success(t("forgotPasswordEmailSent"));
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full" data-testid="forgot-password-card">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("forgotPasswordCheckEmail")}</CardTitle>
          <CardDescription>
            {t("forgotPasswordCheckEmailDescription")}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full" data-testid="forgot-password-back-to-login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("backToLogin")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid="forgot-password-card">
      <CardHeader className="text-center space-y-1">
        <div className="flex justify-center mb-4">
          <div className="text-4xl font-bold text-gradient font-serif">
            NEXO
          </div>
        </div>
        <CardTitle className="text-2xl">{t("forgotPasswordTitle")}</CardTitle>
        <CardDescription>
          {t("forgotPasswordDescription")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} data-testid="forgot-password-form">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              data-testid="forgot-password-email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive" data-testid="forgot-password-email-error">
                {errors.email.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            data-testid="forgot-password-submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? t("sending") : t("forgotPasswordSubmit")}
          </Button>

          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            data-testid="forgot-password-back-link"
          >
            <ArrowLeft className="w-3 h-3" />
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
