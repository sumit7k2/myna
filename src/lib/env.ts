import Constants from 'expo-constants';

const extra = (Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {}) as Record<string, any>;

export const ENV = {
  USE_MOCKS: Boolean(extra.USE_MOCKS),
  GRAPHQL_ENDPOINT: (extra.GRAPHQL_ENDPOINT as string) || 'https://example.com/graphql',
  SENTRY_DSN: (extra.SENTRY_DSN as string) || ''
};
