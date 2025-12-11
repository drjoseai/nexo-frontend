"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  User,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { Locale } from "@/i18n/config";

interface NavItem {
  href: string;
  labelKey: "avatars" | "profile" | "subscription" | "settings";
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
];

export function Sidebar() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const { user, logout } = useAuthStore();
  const t = useTranslations("navigation");
  const tSidebar = useTranslations("sidebar");
  const tAuth = useTranslations("auth");

  const handleLogout = () => {
    logout();
  };

  return (
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
  );
}
