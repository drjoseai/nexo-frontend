"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/lib/store/auth";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();
  
  const isInChat = pathname?.startsWith("/dashboard/chat");

  // Load user data on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Redirect to login if not authenticated (backup for middleware)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Oculto en móvil cuando estamos en chat */}
      <div className={cn(
        isInChat ? "hidden lg:block" : "block"
      )}>
        <Sidebar />
      </div>

      {/* Main content - Sin padding en móvil cuando estamos en chat */}
      <main className={cn(
        isInChat ? "pl-0 lg:pl-64" : "pl-64"
      )}>
        <div className={cn(
          isInChat ? "h-screen" : "container py-8"
        )}>
          {children}
        </div>
      </main>
      <PWAInstallPrompt />
    </div>
  );
}

