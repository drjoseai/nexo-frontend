"use client";

import { Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-lg font-bold text-gradient">NEXO</span>
      </Link>
      
      {/* Hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </header>
  );
}

