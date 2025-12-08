import type { Metadata, Viewport } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  ],
  authors: [{ name: "NEXO Team" }],
  creator: "NEXO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexo.ai",
    siteName: "NEXO",
    title: "NEXO - Authentic Emotional Connection with AI",
    description:
      "NEXO offers genuine companionship through three distinct AI personalities.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXO - Authentic Emotional Connection with AI",
    description:
      "NEXO offers genuine companionship through three distinct AI personalities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1B3D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${montserrat.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
