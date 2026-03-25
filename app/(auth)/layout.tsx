/**
 * Auth Layout for NEXO v2.0
 *
 * Layout for authentication pages (login, register, forgot-password).
 * Uses h-dvh (dynamic viewport height) so the layout shrinks when
 * the keyboard opens on iOS/Android, eliminating the black gap.
 */

import type { Metadata } from "next";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "NEXO - Autenticación",
  description: "Inicia sesión o regístrate en NEXO v2.0",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col bg-background"
      style={{ minHeight: "100dvh" }}
    >
      {/* Main content area */}
      {/* min-h-dvh + overflow-y-auto: se ajusta cuando el teclado abre en iOS/Android */}
      <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {children}
        </div>
      </main>

      {/* Footer - oculto en mobile para evitar página scrollable */}
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
