export type AnalyticsAdapter = {
  identify: (userId: string, traits?: Record<string, any>) => void;
  track: (event: string, properties?: Record<string, any>) => void;
  screen: (name: string, properties?: Record<string, any>) => void;
  logError?: (error: Error, context?: Record<string, any>) => void;
};

const noop: AnalyticsAdapter = {
  identify: () => {},
  track: () => {},
  screen: () => {},
  logError: () => {}
};

let current: AnalyticsAdapter = noop;

export function setAnalytics(adapter: AnalyticsAdapter) {
  current = adapter || noop;
}

export function getAnalytics(): AnalyticsAdapter {
  return current;
}

export function identify(userId: string, traits?: Record<string, any>) {
  try { current.identify(userId, traits); } catch {}
}

export function track(event: string, properties?: Record<string, any>) {
  try { current.track(event, properties); } catch {}
}

export function screen(name: string, properties?: Record<string, any>) {
  try { current.screen(name, properties); } catch {}
}

export function logError(error: Error, context?: Record<string, any>) {
  try { current.logError?.(error, context); } catch {}
}
