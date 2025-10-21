jest.mock('@/lib/env', () => ({
  ENV: {
    SENTRY_DSN: 'https://exampledsn',
    SENTRY_TRACES_SAMPLE_RATE: 0.5,
    SENTRY_PROFILES_SAMPLE_RATE: 1.0
  }
}));

import * as Sentry from 'sentry-expo';
import { initSentry, routingInstrumentation } from '@/lib/sentry';

describe('Sentry initialization', () => {
  it('initializes with DSN, tracing, and routing instrumentation', () => {
    (Sentry.init as jest.Mock).mockClear();
    initSentry();
    expect((Sentry.init as jest.Mock)).toHaveBeenCalledTimes(1);
    const arg = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(arg.dsn).toBe('https://exampledsn');
    expect(Array.isArray(arg.integrations)).toBe(true);
    expect(arg.integrations.length).toBeGreaterThan(0);
    expect(typeof arg.tracesSampleRate).toBe('number');
    expect(typeof arg.profilesSampleRate).toBe('number');
    expect(routingInstrumentation).toBeDefined();
  });
});
