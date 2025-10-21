import Constants from 'expo-constants';

const extra = (Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {}) as Record<string, any>;

const nodeEnv = (process.env.NODE_ENV as string | undefined) || 'development';
const defaultUseMocks = extra.USE_MOCKS !== undefined ? Boolean(extra.USE_MOCKS) : nodeEnv !== 'production';

function parseNumber(v: any): number | undefined {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? parseFloat(v) : NaN;
  return isNaN(n) ? undefined : n;
}

export const ENV = {
  USE_MOCKS: defaultUseMocks,
  GRAPHQL_ENDPOINT: (extra.GRAPHQL_ENDPOINT as string) || 'https://example.com/graphql',
  SENTRY_DSN: (extra.SENTRY_DSN as string) || '',
  SENTRY_TRACES_SAMPLE_RATE: parseNumber(extra.SENTRY_TRACES_SAMPLE_RATE),
  SENTRY_PROFILES_SAMPLE_RATE: parseNumber(extra.SENTRY_PROFILES_SAMPLE_RATE)
};
