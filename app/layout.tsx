import type { Metadata, Viewport } from "next";
import { DM_Sans, Cormorant_Garamond, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PWAUpdateNotification } from "@/components/pwa";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { CookieBanner } from "@/components/cookie-consent";
import { OfflineScreen } from "@/components/native/OfflineScreen";
import PWAInstallSuppressor from "@/components/PWAInstallSuppressor";
import { KeyboardTrackerInit } from "@/components/ui/KeyboardTrackerInit";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// PWA Viewport Configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#110e0c",
  colorScheme: "dark light",
  viewportFit: "cover",
  // interactiveWidget removido: Safari iOS no lo soporta y rompe 100dvh
  // Android Chrome ya maneja el teclado correctamente con 100dvh sin esta directiva
};

// PWA Metadata Configuration
export const metadata: Metadata = {
  title: {
    default: "NEXO - Authentic Emotional Connection with AI",
    template: "%s | NEXO",
  },
  description:
    "NEXO offers genuine companionship through three distinct AI personalities. Available 24/7 in any language.",
  keywords: [
    "AI companion",
    "emotional AI",
    "virtual companion",
    "AI chat",
    "NEXO",
    "AI friend",
    "emotional support",
  ],
  authors: [{ name: "VENKO AI INNOVATIONS LLC" }],
  creator: "VENKO AI INNOVATIONS LLC",
  publisher: "VENKO AI INNOVATIONS LLC",
  
  // PWA Manifest
  manifest: "/manifest.json",
  
  // Apple PWA Meta Tags
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NEXO",
  },
  
  // Format Detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://app.trynexo.ai",
    siteName: "NEXO",
    title: "NEXO - Authentic Emotional Connection with AI",
    description:
      "NEXO offers genuine companionship through three distinct AI personalities. Available 24/7 in any language.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NEXO - AI Companion",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "NEXO - Authentic Emotional Connection with AI",
    description:
      "NEXO offers genuine companionship through three distinct AI personalities.",
    images: ["/og-image.png"],
  },
  
  // Application
  applicationName: "NEXO",
  category: "lifestyle",
  
  // Icons
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  // Other PWA meta
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#c47a52",
    "msapplication-tap-highlight": "no",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning style={{ WebkitTextSizeAdjust: '100%' }}>
      <body
        className={`${dmSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} font-sans antialiased min-h-screen`}
      >
        <KeyboardTrackerInit />
        <PWAInstallSuppressor />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AnalyticsProvider>
              <OfflineScreen>
                <AuthProvider>
                  {children}
                </AuthProvider>
                <Toaster position="top-right" richColors />
                <PWAUpdateNotification />
                <CookieBanner />
              </OfflineScreen>
            </AnalyticsProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
