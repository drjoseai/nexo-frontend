"use client";

import { useState, useEffect } from "react";

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const DEFAULT_INSETS: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>(DEFAULT_INSETS);

  useEffect(() => {
    const loadInsets = async () => {
      try {
        const { SafeArea } = await import("capacitor-plugin-safe-area");
        const result = await SafeArea.getSafeAreaInsets();
        setInsets(result.insets);
      } catch {
        // No estamos en plataforma nativa o plugin no disponible.
        // CSS env(safe-area-inset-*) se encarga en web.
      }
    };
    loadInsets();
  }, []);

  return insets;
}
