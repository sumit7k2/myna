import * as Sentry from 'sentry-expo';
import { ENV } from './env';

// React Navigation routing instrumentation for Sentry performance tracing
export const routingInstrumentation = new (Sentry as any).Native.ReactNavigationInstrumentation();

export function initSentry() {
  if (!ENV.SENTRY_DSN) return;
  const tracesSampleRate = typeof ENV.SENTRY_TRACES_SAMPLE_RATE === 'number' ? ENV.SENTRY_TRACES_SAMPLE_RATE : 1.0;
  const profilesSampleRate = typeof ENV.SENTRY_PROFILES_SAMPLE_RATE === 'number' ? ENV.SENTRY_PROFILES_SAMPLE_RATE : 1.0;

  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    debug: __DEV__,
    enableInExpoDevelopment: true,
    tracesSampleRate,
    profilesSampleRate,
    integrations: [
      new (Sentry as any).Native.ReactNativeTracing({
        routingInstrumentation
      })
    ]
  });

  registerGlobalErrorHandlers();
}

export function registerGlobalErrorHandlers() {
  try {
    const defaultHandler = (global as any)?.ErrorUtils?.getGlobalHandler?.();
    (global as any)?.ErrorUtils?.setGlobalHandler?.((error: any, isFatal?: boolean) => {
      try {
        (Sentry as any).Native.captureException?.(error);
      } catch {}
      if (typeof defaultHandler === 'function') {
        try {
          defaultHandler(error, isFatal);
        } catch {}
      }
    });
  } catch {}
}
