import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ComposeScreen from '@/features/compose/ComposeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { clearQueue, getQueue } from '@/features/compose/offlineQueue';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Theme name="light">
          <ApolloProvider client={apolloClient}>{ui}</ApolloProvider>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

describe('Offline compose queue UI', () => {
  beforeEach(() => {
    clearQueue();
  });

  it('shows queued count and allows cancel', async () => {
    const { getByTestId } = renderWithProviders(<ComposeScreen />);

    const input = getByTestId('compose-input');
    await act(async () => {
      fireEvent.changeText(input, 'Hello offline');
    });

    await act(async () => {
      fireEvent.press(getByTestId('post-btn'));
    });

    // Should show queued count
    expect(getByTestId('queued-count').props.children.join('')).toContain('1');

    const q = getQueue();
    expect(q.length).toBe(1);

    // Cancel the queued item
    const cancelBtn = getByTestId(`cancel-${q[0].id}`);
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(getByTestId('queued-count').props.children.join('')).toContain('0');
  });
});
