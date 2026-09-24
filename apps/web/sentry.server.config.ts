/**
 * LeadMap AI — Sentry Server Configuration
 * Configures Node.js SSR error reporting and distributed tracing.
 */

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryServerConfig = {
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  release: process.env.NEXT_PUBLIC_RELEASE_VERSION || 'leadmap-web@1.0.0',
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
};

export default sentryServerConfig;
