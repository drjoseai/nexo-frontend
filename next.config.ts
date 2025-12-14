import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Bundle analyzer - solo en análisis
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Optimizaciones de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Experimental features para mejor performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-slot",
    ],
  },

  // Headers de seguridad y cache
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              // Default: solo desde el mismo origen
              "default-src 'self'",
              // Scripts: self + inline (Next.js lo requiere) + eval (dev mode)
              process.env.NODE_ENV === "production"
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos: self + inline (Tailwind/CSS-in-JS)
              "style-src 'self' 'unsafe-inline'",
              // Imágenes: self + data URLs + HTTPS externo
              "img-src 'self' data: https:",
              // Fuentes: self + Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Conexiones API: self + backend + WebSocket dev
              "connect-src 'self' https://api.nexo.ai https://nexo-v2-core.onrender.com http://localhost:8000 ws://localhost:3000 wss://localhost:3000",
              // No permitir frames externos
              "frame-ancestors 'none'",
              // Form actions solo al mismo origen
              "form-action 'self'",
              // Base URI restringido
              "base-uri 'self'",
              // Upgrade HTTP a HTTPS en producción
              process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : "",
            ].filter(Boolean).join("; "),
          },
        ],
      },
      {
        // Cache estático para assets
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Webpack customizations
  webpack: (config, { isServer }) => {
    // Optimización de chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          // Vendor chunk para librerías grandes
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          // Chunk separado para Radix UI
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: "radix",
            chunks: "all",
            priority: 20,
          },
          // Chunk separado para componentes comunes
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
