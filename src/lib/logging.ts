import { addBreadcrumb, captureException, captureMessage, sentryEnabled } from './sentry';

export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

export function logEvent(name: string, props?: Record<string, any>, level: LogLevel = 'info') {
  if (!sentryEnabled) {
    // eslint-disable-next-line no-console
    console.log(`[event] ${name}`, props ?? {});
    return;
  }
  addBreadcrumb({ category: 'event', message: name, level: level === 'error' ? 'error' : level, data: props });
}

export function logError(error: unknown, context?: Record<string, any>) {
  captureException(error, context);
}

export function logMessage(message: string, context?: Record<string, any>, level: LogLevel = 'info') {
  if (level === 'error') {
    captureException(new Error(message), context);
  } else {
    captureMessage(message, context);
  }
}
