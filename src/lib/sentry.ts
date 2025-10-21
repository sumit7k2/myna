import * as Sentry from 'sentry-expo';
import { ENV } from './env';

export const sentryEnabled = Boolean(ENV.SENTRY_DSN);

// React Navigation routing instrumentation will be registered by the navigator at runtime
export let routingInstrumentation: any | null = null;

export function initSentry() {
  if (!sentryEnabled) return;

  // Create routing instrumentation for React Navigation
  try {
    routingInstrumentation = new (Sentry as any).Native.ReactNavigationInstrumentation();
  } catch {
    routingInstrumentation = null;
  }

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    debug: __DEV__,
    enableInExpoDevelopment: true,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 1.0),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0.0),
    integrations: [
      // Performance tracing with routing instrumentation
      (() => {
        try {
          return new (Sentry as any).Native.ReactNativeTracing({
            routingInstrumentation,
          });
        } catch {
          return undefined;
        }
      })(),
    ].filter(Boolean),
  } as any);
}

export function registerNavigationContainer(navRef: any) {
  if (routingInstrumentation && navRef) {
    try {
      (routingInstrumentation as any).registerNavigationContainer(navRef);
    } catch {
      // noop
    }
  }
}

export function captureException(error: unknown, context?: Record<string, any>) {
  if (!sentryEnabled) {
    // eslint-disable-next-line no-console
    console.error(error);
    return;
  }
  try {
    (Sentry as any).Native?.captureException?.(error, { extra: context });
  } catch {
    // noop
  }
}

export function captureMessage(message: string, context?: Record<string, any>) {
  if (!sentryEnabled) {
    // eslint-disable-next-line no-console
    console.warn('[log]', message, context ?? {});
    return;
  }
  try {
    (Sentry as any).Native?.captureMessage?.(message, { extra: context });
  } catch {
    // noop
  }
}

export function addBreadcrumb(crumb: { category?: string; message?: string; level?: 'info' | 'error' | 'warning'; data?: any }) {
  if (!sentryEnabled) {
    // eslint-disable-next-line no-console
    console.debug('[breadcrumb]', crumb);
    return;
  }
  try {
    (Sentry as any).Native?.addBreadcrumb?.(crumb);
  } catch {
    // noop
  }
}
