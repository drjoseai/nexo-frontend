import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay (opcional, consume quota)
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  
  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Don't send PII
  sendDefaultPii: false,
  
  // Ignore common non-actionable errors
  ignoreErrors: [
    // Network errors
    "Network request failed",
    "Failed to fetch",
    "NetworkError",
    "AbortError",
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // User cancellation
    "User denied",
    "cancelled",
  ],
  
  // Filter out noisy transactions
  beforeSendTransaction(event) {
    // Don't send health check transactions
    if (event.transaction?.includes("/health") || event.transaction?.includes("/_next")) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
