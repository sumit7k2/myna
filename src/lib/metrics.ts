import { logEvent } from './logging';

const appStartAt = Date.now();

export function reportStartupCompleted(extra?: Record<string, any>) {
  const ms = Date.now() - appStartAt;
  logEvent('app_startup', { duration_ms: ms, ...(extra ?? {}) });
}
