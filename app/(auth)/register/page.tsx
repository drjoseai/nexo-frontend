"use client";

/**
 * Register Page for NEXO v2.0
 * 
 * Handles user registration with email, password, and optional display name
 * Features form validation with react-hook-form and zod
 * 
 * @module app/(auth)/register/page
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
 * Register form validation schema
 */
const registerSchema = z
  .object({
    display_name: z
      .string()
      .transform((val) => val?.trim() || "")
      .optional(),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Formato de email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/\d/, "La contraseña debe contener al menos un número")
      .max(100, "La contraseña es demasiado larga"),
    confirm_password: z
      .string()
      .min(1, "Debes confirmar tu contraseña"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();

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
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      display_name: undefined,
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Remove confirm_password before sending to API
      const { confirm_password, ...registerData } = data;
      
      await registerUser(registerData);
      
      toast.success("¡Cuenta creada exitosamente!", {
        description: "Bienvenido a NEXO",
      });
      
      router.push("/dashboard");
    } catch (error: any) {
      // Error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear la cuenta. Por favor, intenta de nuevo.";
      
      toast.error("Error al crear cuenta", {
        description: errorMessage,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="text-center space-y-1">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-4">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            NEXO
          </div>
        </div>

        <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
        <CardDescription>
          Únete a NEXO y conoce a tus compañeros de IA
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Display Name Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="display_name">
              Nombre para mostrar <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="display_name"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              aria-invalid={!!errors.display_name}
              disabled={isLoading}
              {...register("display_name")}
            />
            {errors.display_name && (
              <p className="text-sm text-destructive">
                {errors.display_name.message}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isLoading}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmar Contraseña</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              disabled={isLoading}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>

          {/* Login Link */}
          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

