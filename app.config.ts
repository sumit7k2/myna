import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const USE_MOCKS = process.env.USE_MOCKS === 'true';

const config: ExpoConfig = {
  name: 'Expo TS Starter',
  slug: 'expo-ts-starter',
  version: '1.0.0',
  scheme: 'expotsstarter',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    }
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png'
  },
  experiments: {
    typedRoutes: false
  },
  plugins: [
    [
      'sentry-expo',
      {
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT
      }
    ]
  ],
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID
    },
    USE_MOCKS,
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT ?? 'https://example.com/graphql',
    SENTRY_DSN: process.env.SENTRY_DSN ?? ''
  }
};

export default config;
