"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useSafeAreaInsets } from "@/lib/hooks/use-safe-area";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { top } = useSafeAreaInsets();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex flex-col border-b border-border bg-background lg:hidden"
      style={{
        paddingTop: top > 0 ? `${top}px` : 'env(safe-area-inset-top, 0px)'
      }}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/nexo-logo-source.png"
            alt="NEXO"
            width={80}
            height={28}
            className="object-contain"
            priority
          />
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
      </div>
    </header>
  );
}
