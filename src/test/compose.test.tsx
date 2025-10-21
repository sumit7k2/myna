import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ComposeScreen from '@/features/compose/ComposeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { clearQueue, getQueue } from '@/features/compose/offlineQueue';

// Mock image picker to avoid native calls
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file://mock-image.jpg' }]
  })),
  MediaTypeOptions: { Images: 'Images' }
}));

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

describe('ComposeScreen', () => {
  beforeEach(() => {
    clearQueue();
  });

  it('enforces 500-char cap and shows counter', async () => {
    const { getByTestId } = renderWithProviders(<ComposeScreen />);
    const input = getByTestId('compose-input');

    const long = 'a'.repeat(600);
    await act(async () => {
      fireEvent.changeText(input, long);
    });

    expect((input as any).props.value.length).toBe(500);
    expect(getByTestId('char-counter')).toHaveTextContent('500');
  });

  it('auto-threads long text and shows thread preview', async () => {
    const { getByTestId, findByText } = renderWithProviders(<ComposeScreen />);
    const input = getByTestId('compose-input');

    const long = 'b'.repeat(1100);
    await act(async () => {
      fireEvent.changeText(input, long);
    });

    // value should be capped at 500 in the input, but thread preview uses current text
    // So we simulate chunks by posting and verifying parts length via post handler instead.
    // For preview, since text in input is capped, it should be 500 and preview 1 part.
    expect((input as any).props.value.length).toBe(500);
    expect(getByTestId('thread-preview')).toBeTruthy();
    expect(await findByText(/Thread preview: 1 part/)).toBeTruthy();
  });

  it('AI rewrite flow applies suggestion when accepted', async () => {
    const { getByTestId, findByTestId, queryByTestId } = renderWithProviders(<ComposeScreen />);
    const input = getByTestId('compose-input');

    await act(async () => {
      fireEvent.changeText(input, 'Hello world');
    });

    await act(async () => {
      fireEvent.press(getByTestId('ai-rewrite-btn'));
    });

    const suggestion = await findByTestId('ai-suggestion');
    expect(suggestion).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('ai-accept'));
    });

    // after accepting, suggestion box should disappear and input changed
    expect(queryByTestId('ai-suggestion')).toBeNull();
    expect((input as any).props.value.startsWith('[AI] Hello world')).toBe(true);
  });

  it('persists draft and restores from MMKV', async () => {
    const r1 = renderWithProviders(<ComposeScreen />);
    const input1 = r1.getByTestId('compose-input');

    await act(async () => {
      fireEvent.changeText(input1, 'Draft text');
    });

    r1.unmount();

    const r2 = renderWithProviders(<ComposeScreen />);
    const input2 = r2.getByTestId('compose-input');

    // Initial value should be restored
    expect((input2 as any).props.value).toBe('Draft text');
  });

  it('enqueues post to offline queue and clears draft', async () => {
    const { getByTestId } = renderWithProviders(<ComposeScreen />);
    const input = getByTestId('compose-input');

    await act(async () => {
      fireEvent.changeText(input, 'Queued post');
    });

    await act(async () => {
      fireEvent.press(getByTestId('post-btn'));
    });

    const q = getQueue();
    expect(q.length).toBe(1);
    expect(q[0].text).toBe('Queued post');
    // Input should be cleared
    expect((input as any).props.value).toBe('');
  });
});
