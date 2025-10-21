import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ComposeScreen from '@/features/compose/ComposeScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { clearQueue } from '@/features/compose/offlineQueue';

// Mock image picker with permission handling
const mockPicker: any = {
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [] })),
  launchCameraAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file://camera.jpg' }] })),
  MediaTypeOptions: { Images: 'Images' }
};

jest.mock('expo-image-picker', () => mockPicker);

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

describe('ComposeScreen media picker', () => {
  beforeEach(() => {
    clearQueue();
    jest.clearAllMocks();
  });

  it('adds up to 4 attachments and prevents exceeding the cap', async () => {
    const { getByTestId, queryAllByTestId } = renderWithProviders(<ComposeScreen />);

    mockPicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file://a.jpg' },
        { uri: 'file://b.jpg' },
        { uri: 'file://c.jpg' }
      ]
    });

    await act(async () => {
      fireEvent.press(getByTestId('add-image-btn'));
    });

    expect(queryAllByTestId(/attachment-uri-/).length).toBe(3);

    mockPicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file://d.jpg' },
        { uri: 'file://e.jpg' }
      ]
    });

    await act(async () => {
      fireEvent.press(getByTestId('add-image-btn'));
    });

    // Should cap at 4 attachments
    expect(queryAllByTestId(/attachment-uri-/).length).toBe(4);
  });

  it('reorders and removes attachments', async () => {
    const { getByTestId } = renderWithProviders(<ComposeScreen />);

    mockPicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file://a.jpg' },
        { uri: 'file://b.jpg' },
        { uri: 'file://c.jpg' }
      ]
    });

    await act(async () => {
      fireEvent.press(getByTestId('add-image-btn'));
    });

    // Move first to the right
    await act(async () => {
      fireEvent.press(getByTestId('move-right-0'));
    });

    // After move, second item should now be the first's uri
    expect(getByTestId('attachment-uri-1').props.children).toBe('file://a.jpg');

    // Remove second item
    await act(async () => {
      fireEvent.press(getByTestId('remove-1'));
    });

    // Now the list should have 2 items
    expect(getByTestId('attachment-uri-0')).toBeTruthy();
    expect(() => getByTestId('attachment-uri-2')).toThrow();
  });

  it('persists attachments with draft and restores them', async () => {
    const r1 = renderWithProviders(<ComposeScreen />);

    mockPicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'file://x.jpg' },
        { uri: 'file://y.jpg' }
      ]
    });

    await act(async () => {
      fireEvent.press(r1.getByTestId('add-image-btn'));
    });

    r1.unmount();

    const r2 = renderWithProviders(<ComposeScreen />);

    // Should restore previously added attachments
    expect(r2.getByTestId('attachment-uri-0').props.children).toBe('file://x.jpg');
    expect(r2.getByTestId('attachment-uri-1').props.children).toBe('file://y.jpg');
  });

  it('does not add media when permission is denied', async () => {
    const { getByTestId, queryAllByTestId } = renderWithProviders(<ComposeScreen />);

    mockPicker.requestMediaLibraryPermissionsAsync.mockResolvedValueOnce({ granted: false, status: 'denied' });

    await act(async () => {
      fireEvent.press(getByTestId('add-image-btn'));
    });

    expect(queryAllByTestId(/attachment-uri-/).length).toBe(0);
  });
});
