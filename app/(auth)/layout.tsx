/**
 * Auth Layout for NEXO v2.0
 * 
 * Layout for authentication pages (login, register, forgot-password)
 * Features a centered design with dark gradient background
 * 
 * @module app/(auth)/layout
 */

import type { Metadata } from "next";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-purple-950 dark:via-blue-950 dark:to-indigo-950 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

