/**
 * LeadMap AI — Sentry Edge Configuration
 * Configures Edge runtime error reporting.
 */

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryEdgeConfig = {
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  release: process.env.NEXT_PUBLIC_RELEASE_VERSION || 'leadmap-web@1.0.0',
  tracesSampleRate: 0.1,
};

export default sentryEdgeConfig;
