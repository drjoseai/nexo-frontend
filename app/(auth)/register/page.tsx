"use client";

/**
 * Register Page for NEXO v2.0
 * 
 * Handles user registration with email, password, date of birth, and TOS acceptance
 * Features form validation with react-hook-form and zod
 * Internationalized with next-intl
 * 
 * @module app/(auth)/register/page
 */

import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

/**
 * Calculate age from date of birth
 */
const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Register form validation schema with i18n messages
 */
const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      display_name: z
        .string()
        .transform((val) => val?.trim() || "")
        .optional(),
      email: z
        .string()
        .min(1, t("emailRequired"))
        .email(t("emailInvalid")),
      password: z
        .string()
        .min(8, t("passwordMinLength8"))
        .regex(/\d/, t("passwordNeedsNumber"))
        .max(100, t("passwordMaxLength")),
      confirm_password: z
        .string()
        .min(1, t("confirmPasswordRequired")),
      date_of_birth: z
        .string()
        .min(1, t("dateOfBirthRequired"))
        .refine((val) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        }, t("dateOfBirthInvalid"))
        .refine((val) => {
          const date = new Date(val);
          return calculateAge(date) >= 18;
        }, t("mustBe18")),
      tos_accepted: z
        .boolean()
        .refine((val) => val === true, t("tosRequired")),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: t("passwordsDoNotMatch"),
      path: ["confirm_password"],
    });

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");

  // Create schema with translated messages
  const registerSchema = createRegisterSchema(t);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: undefined,
      email: "",
      password: "",
      confirm_password: "",
      date_of_birth: "",
      tos_accepted: false,
    },
  });

  // Watch tos_accepted for controlled checkbox
  const tosAccepted = watch("tos_accepted");

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirm_password before sending to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm_password, ...registerData } = data;
      
      await registerUser(registerData);
      
      toast.success(t("registerSuccess"), {
        description: t("registerSuccessDescription"),
      });
      
      router.push("/onboarding");
    } catch (error: unknown) {
      // Error handling
      const errorMessage =
        (error as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (error as { message?: string })?.message ||
        t("registerErrorDescription");
      
      toast.error(t("registerError"), {
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="w-full" data-testid="register-card">
      <CardHeader className="text-center space-y-1">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-4">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NEXO
          </div>
        </div>

        <CardTitle className="text-2xl">{t("createAccount")}</CardTitle>
        <CardDescription>
          {t("createAccountDescription")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} data-testid="register-form">
        <CardContent className="space-y-4">
          {/* Display Name Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="display_name">
              {t("displayName")}{" "}
              <span className="text-muted-foreground">({tCommon("optional")})</span>
            </Label>
            <Input
              id="display_name"
              data-testid="register-display-name"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              aria-invalid={!!errors.display_name}
              disabled={isLoading}
              {...register("display_name")}
            />
            {errors.display_name && (
              <p className="text-sm text-destructive" data-testid="register-display-name-error">
                {errors.display_name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              data-testid="register-email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive" data-testid="register-email-error">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">{t("dateOfBirth")}</Label>
            <Input
              id="date_of_birth"
              data-testid="register-date-of-birth"
              type="date"
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              aria-invalid={!!errors.date_of_birth}
              disabled={isLoading}
              {...register("date_of_birth")}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-destructive" data-testid="register-date-of-birth-error">
                {errors.date_of_birth.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              data-testid="register-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive" data-testid="register-password-error">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">{t("confirmPassword")}</Label>
            <Input
              id="confirm_password"
              data-testid="register-confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              disabled={isLoading}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive" data-testid="register-confirm-password-error">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {/* Terms of Service Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="tos_accepted"
                data-testid="register-tos-checkbox"
                checked={tosAccepted}
                onCheckedChange={(checked) => setValue("tos_accepted", checked === true)}
                disabled={isLoading}
                aria-invalid={!!errors.tos_accepted}
              />
              <Label 
                htmlFor="tos_accepted" 
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                {t("tosAcceptance")}{" "}
                <Link 
                  href="/terms" 
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {t("termsOfService")}
                </Link>
                {" "}{t("and")}{" "}
                <Link 
                  href="/privacy" 
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  {t("privacyPolicy")}
                </Link>
              </Label>
            </div>
            {errors.tos_accepted && (
              <p className="text-sm text-destructive" data-testid="register-tos-error">
                {errors.tos_accepted.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            data-testid="register-submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? t("creatingAccount") : t("createAccount")}
          </Button>

          {/* Login Link */}
          <p className="text-sm text-center text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href="/login"
              data-testid="register-login-link"
              className="text-primary font-medium hover:underline"
            >
              {t("login")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
