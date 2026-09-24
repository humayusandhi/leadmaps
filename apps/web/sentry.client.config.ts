/**
 * LeadMap AI — Sentry Client Configuration
 * Configures browser-side error reporting and performance tracing.
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryClientConfig = {
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  release: process.env.NEXT_PUBLIC_RELEASE_VERSION || 'leadmap-web@1.0.0',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
  maskAllText: true,
  blockAllMedia: true,
};

export default sentryClientConfig;
