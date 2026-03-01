import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Mobile/Capacitor build flag.
 * When true, enables static export mode for Capacitor native builds.
 * When false/undefined, builds normally for Vercel SSR deployment.
 */
const isMobile = process.env.NEXT_PUBLIC_IS_MOBILE === "true";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Bundle analyzer - solo en análisis
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// PWA - disabled for mobile builds (Capacitor handles native features)
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || isMobile,
  register: !isMobile,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.trynexo\.ai\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24,
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // === CAPACITOR STATIC EXPORT (conditional) ===
  ...(isMobile
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {}),

  // Optimización de imágenes
  images: isMobile
    ? {
        // Static export requires unoptimized images
        unoptimized: true,
      }
    : {
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

  // Headers de seguridad y cache — NOT supported in static export
  ...(isMobile
    ? {}
    : {
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
                {
                  key: "Content-Security-Policy",
                  value: [
                    "default-src 'self'",
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: blob: https:",
                    "font-src 'self' https://fonts.gstatic.com",
                    "connect-src 'self' https://api.nexo.ai https://api.trynexo.ai https://nexo-v2-core.onrender.com http://localhost:8000 ws://localhost:3000 wss://localhost:3000 https://api-js.mixpanel.com https://api.mixpanel.com https://*.mixpanel.com https://*.ingest.sentry.io https://*.sentry.io",
                    "frame-ancestors 'none'",
                    "form-action 'self'",
                    "base-uri 'self'",
                    process.env.NODE_ENV === "production"
                      ? "upgrade-insecure-requests"
                      : "",
                  ]
                    .filter(Boolean)
                    .join("; "),
                },
              ],
            },
            {
              source: "/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
            {
              source: "/sw.js",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=0, must-revalidate",
                },
              ],
            },
          ];
        },
      }),

  // Webpack customizations
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("mixpanel-browser");
    }

    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: "radix",
            chunks: "all",
            priority: 20,
          },
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

const sentryConfig = {
  silent: true,
  disableServerWebpackPlugin: process.env.NODE_ENV !== "production",
  disableClientWebpackPlugin: process.env.NODE_ENV !== "production",
  hideSourceMaps: true,
  telemetry: false,
};

// For mobile builds, skip Sentry webpack plugin wrapping to avoid static export issues
const configWithPlugins = isMobile
  ? withBundleAnalyzer(withNextIntl(nextConfig))
  : withSentryConfig(
      withPWA(withBundleAnalyzer(withNextIntl(nextConfig))),
      sentryConfig
    );

export default configWithPlugins;
