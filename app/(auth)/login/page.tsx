"use client";

/**
 * Login Page for NEXO v2.0
 * 
 * Handles user authentication with email and password
 * Features form validation with react-hook-form and zod
 * Internationalized with next-intl
 * 
 * @module app/(auth)/login/page
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth";
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

/**
 * Login form validation schema with i18n messages
 */
const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t("emailRequired"))
      .email(t("emailInvalid")),
    password: z
      .string()
      .min(6, t("passwordMinLength6"))
      .max(100, t("passwordMaxLength")),
  });

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const t = useTranslations("auth");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Create schema with translated messages
  const loginSchema = createLoginSchema(t);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('[LoginPage] Login attempt started');
      setIsRedirecting(true);
      
      await login(data);
      
      console.log('[LoginPage] Login successful, redirecting...');
      
      // Show success toast
      toast.success(t("loginSuccess"), {
        description: t("loginSuccessDescription"),
      });
      
      // Small delay to ensure state is fully updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('[LoginPage] Executing redirect to /dashboard');
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: unknown) {
      setIsRedirecting(false); // Reset on error
      
      // Error handling
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        t("loginErrorDescription");

      toast.error(t("loginError"), {
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="w-full" data-testid="login-card">
      <CardHeader className="text-center space-y-1">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-4">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NEXO
          </div>
        </div>

        <CardTitle className="text-2xl">{t("login")}</CardTitle>
        <CardDescription>
          {t("enterCredentials")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} data-testid="login-form">
        <CardContent className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              data-testid="login-email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isLoading || isRedirecting}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive" data-testid="login-email-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              data-testid="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              disabled={isLoading || isRedirecting}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive" data-testid="login-password-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              disabled
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-forgot-password"
            >
              {t("forgotPassword")}
            </button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            data-testid="login-submit"
            className="w-full"
            disabled={isLoading || isRedirecting}
            size="lg"
          >
            {isLoading || isRedirecting ? t("loggingIn") : t("login")}
          </Button>

          {/* Register Link */}
          <p className="text-sm text-center text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href="/register"
              data-testid="login-register-link"
              className="text-primary font-medium hover:underline"
            >
              {t("register")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
