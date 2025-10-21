import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../tamagui.config';
import RootNavigator from '@/navigation/RootNavigator';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@/state/theme';
import { initSentry } from '@/lib/sentry';
import { ENV } from '@/lib/env';
import { startMocks } from '@/mocks';
import { registerMockDevTools } from '@/mocks/devtools';
import ErrorBoundary from '@/components/ErrorBoundary';

initSentry();

export default function App() {
  const sys = useColorScheme();
  const themePref = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (ENV.USE_MOCKS) {
      startMocks();
      if (__DEV__) {
        registerMockDevTools();
      }
    }
  }, []);

  const themeName = themePref === 'system' ? sys || 'light' : themePref;

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Theme name={themeName}>
          <QueryClientProvider client={queryClient}>
            <ApolloProvider client={apolloClient}>
              <ErrorBoundary>
                <RootNavigator />
              </ErrorBoundary>
            </ApolloProvider>
          </QueryClientProvider>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
