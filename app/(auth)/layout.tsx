/**
 * Auth Layout for NEXO v2.0
 * 
 * Layout for authentication pages (login, register, forgot-password)
 * Features a centered design with dark gradient background
 * 
 * @module app/(auth)/layout
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main content area */}
      {/* En mobile: h-dvh + overflow-hidden evita que iOS haga scroll de la pagina */}
      {/* cuando el teclado abre, eliminando el gap negro arriba/abajo */}
      <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {children}
        </div>
      </main>
      
      {/* Footer - oculto en mobile para evitar pagina scrollable */}
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
