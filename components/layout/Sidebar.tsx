"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  User,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
  X,
  HelpCircle,
  Download,
  MessageSquareHeart,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { usePWA } from "@/lib/hooks/use-pwa";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Locale } from "@/i18n/config";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

interface NavItem {
  href: string;
  labelKey: "avatars" | "profile" | "subscription" | "settings" | "help";
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    labelKey: "avatars",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    href: "/dashboard/profile",
    labelKey: "profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    href: "/dashboard/subscription",
    labelKey: "subscription",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: "/dashboard/settings",
    labelKey: "settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    href: "/dashboard/help",
    labelKey: "help",
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const t = useTranslations("navigation");
  const tSidebar = useTranslations("sidebar");
  const tAuth = useTranslations("auth");
  const tPwa = useTranslations("pwa.install");
  const { canInstall, isInstalled, promptInstall } = usePWA();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          console.warn('[Logout] Router navigation incomplete, using window.location fallback');
          window.location.href = '/login';
        }
      }, 300);
    } catch (error) {
      console.error('[Logout] Error during logout:', error);
      window.location.href = '/login';
    }
  };

  const handleNavClick = () => {
    // Close drawer on mobile when clicking a link
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile drawer mode
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-300 ease-in-out lg:hidden",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Header with close button */}
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={handleNavClick}>
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-gradient">NEXO</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    {item.icon}
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            {/* Feedback button */}
            <div className="px-3 pb-2">
              <button
                onClick={() => {
                  setIsFeedbackOpen(true);
                  if (isMobile && onClose) onClose();
                }}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
              >
                <MessageSquareHeart className="h-5 w-5" />
                {tSidebar("feedback")}
              </button>
            </div>

            {/* Install App button */}
            {canInstall && !isInstalled && (
              <div className="px-3 pb-3">
                <button
                  onClick={() => promptInstall()}
                  className="w-full flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/50"
                >
                  <Download className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span>{tPwa("sidebarButton")}</span>
                    <span className="text-[10px] font-normal text-primary/60">
                      {tPwa("description")}
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* User section */}
            <div className="border-t border-sidebar-border p-4">
              {/* Plan badge */}
              <div className="mb-3 flex items-center justify-between rounded-lg bg-sidebar-accent/50 px-3 py-2">
                <span className="text-xs text-muted-foreground">
                  {tSidebar("currentPlan")}
                </span>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                  {user?.plan || "free"}
                </span>
              </div>

              {/* User info */}
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">
                    {user?.display_name || user?.email?.split("@")[0] || "Usuario"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Language selector */}
              <div className="mb-3">
                <LanguageSelector
                  currentLocale={locale}
                  variant="ghost"
                  showLabel={true}
                  className="w-full justify-start"
                />
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {tAuth("logout")}
              </Button>
            </div>
          </div>
        </aside>
        <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      </>
    );
  }

  // Desktop sidebar (unchanged behavior)
  return (
    <>
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gradient">NEXO</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  {item.icon}
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Feedback button */}
          <div className="px-3 pb-2">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
            >
              <MessageSquareHeart className="h-5 w-5" />
              {tSidebar("feedback")}
            </button>
          </div>

          {/* Install App button */}
          {canInstall && !isInstalled && (
            <div className="px-3 pb-3">
              <button
                onClick={() => promptInstall()}
                className="w-full flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/50"
              >
                <Download className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span>{tPwa("sidebarButton")}</span>
                  <span className="text-[10px] font-normal text-primary/60">
                    {tPwa("description")}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* User section */}
          <div className="border-t border-sidebar-border p-4">
            {/* Plan badge */}
            <div className="mb-3 flex items-center justify-between rounded-lg bg-sidebar-accent/50 px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {tSidebar("currentPlan")}
              </span>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold capitalize text-primary">
                {user?.plan || "free"}
              </span>
            </div>

            {/* User info */}
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {user?.display_name || user?.email?.split("@")[0] || "Usuario"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Language selector */}
            <div className="mb-3">
              <LanguageSelector
                currentLocale={locale}
                variant="ghost"
                showLabel={true}
                className="w-full justify-start"
              />
            </div>

            {/* Logout button */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {tAuth("logout")}
            </Button>
          </div>
        </div>
      </aside>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
