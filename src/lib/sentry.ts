import * as Sentry from 'sentry-expo';
import { ENV } from './env';

export function initSentry() {
  if (!ENV.SENTRY_DSN) return;
  Sentry.init({
    dsn: ENV.SENTRY_DSN,
    debug: __DEV__,
    enableInExpoDevelopment: true
  });
}
