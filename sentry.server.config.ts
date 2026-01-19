import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring - lower on server to reduce costs
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Only enable when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Don't send PII
  sendDefaultPii: false,
});

