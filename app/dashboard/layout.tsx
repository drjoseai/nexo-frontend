"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
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
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      {/* Mobile Header - Hidden in chat (chat has its own header) and on desktop */}
      {!isInChat && (
        <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />
      )}

      {/* Mobile Drawer Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Desktop Sidebar - Hidden in chat on mobile (chat handles its own layout) */}
      <div className={cn(
        "hidden lg:block",
        isInChat && "hidden lg:block" // Always show on desktop
      )}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className={cn(
        // Desktop: always pad for sidebar
        "lg:pl-64",
        // Mobile: pad top for header (except in chat which has own header)
        !isInChat && "pt-14 lg:pt-0",
        // Mobile chat: no padding (full screen)
        isInChat && "pl-0"
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
