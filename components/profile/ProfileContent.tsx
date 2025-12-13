"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileContent() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.display_name || user?.email?.split("@")[0] || "",
  });

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
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "trial":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
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
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información personal y preferencias
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Tu información básica de perfil
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span className="ml-2">Guardar</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar placeholder */}
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-500/20 ring-2 ring-purple-500/30">
                <User className="h-10 w-10 text-purple-400" />
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
                <Label htmlFor="displayName">Nombre para mostrar</Label>
                {isEditing ? (
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="Tu nombre"
                  />
                ) : (
                  <p className="flex h-10 items-center text-sm">
                    {user.display_name || "No establecido"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
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
              <Shield className="h-5 w-5 text-purple-400" />
              Suscripción
            </CardTitle>
            <CardDescription>
              Tu plan actual y beneficios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">Plan actual:</span>
                  <Badge className={cn("text-sm", getPlanBadgeColor(user.plan || "free"))}>
                    {(user.plan || "free").toUpperCase()}
                  </Badge>
                </div>
                {user.trial_ends_at && (
                  <p className="text-sm text-muted-foreground">
                    Trial termina: {formatDate(user.trial_ends_at)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="border-purple-500/30 hover:bg-purple-500/10"
                onClick={() => window.location.href = "/dashboard/subscription"}
              >
                Ver planes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              Información de Cuenta
            </CardTitle>
            <CardDescription>
              Detalles de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Cuenta creada</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verificación de edad</p>
                <p className="font-medium">
                  {user.age_verified ? (
                    <span className="text-green-400">Verificado (18+)</span>
                  ) : (
                    <span className="text-muted-foreground">No verificado</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

