import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import ProfileScreen, { UserProfileView } from '@/features/profile/ProfileScreen';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Theme name="light">
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Providers as any });
}

describe('Profile screens', () => {
  it('renders self profile with edit and share actions', async () => {
    const { findByText, getByTestId, queryByTestId } = renderWithProviders(<ProfileScreen />);

    expect(await findByText('John Doe')).toBeTruthy();
    expect(getByTestId('edit-profile')).toBeTruthy();
    expect(getByTestId('share-profile')).toBeTruthy();
    expect(queryByTestId('follow-btn')).toBeNull();

    // tabs present
    expect(await findByText('Posts')).toBeTruthy();
    expect(await findByText('Threads')).toBeTruthy();
    expect(await findByText('Collections')).toBeTruthy();
  });

  it('renders other user with follow toggle and tabs content switching', async () => {
    const { findByText, getByTestId, queryByText } = renderWithProviders(
      <UserProfileView username="janedoe" />
    );

    expect(await findByText('Jane Doe')).toBeTruthy();
    const countEl = getByTestId('followers-count');

    // initial count should be 100
    const beforeText = String((countEl as any).props.children);
    expect(beforeText).toMatch(/100/);

    await act(async () => {
      fireEvent.press(getByTestId('follow-btn'));
    });

    const afterText1 = String((countEl as any).props.children);
    expect(afterText1).toMatch(/101/);
    expect(queryByText('Following')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('follow-btn'));
    });

    const afterText2 = String((countEl as any).props.children);
    expect(afterText2).toMatch(/100/);

    // Tabs content switching
    expect(queryByText('Posts tab')).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByTestId('tab-threads'));
    });
    expect(queryByText('Threads tab')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('tab-collections'));
    });
    expect(queryByText('Collections tab')).toBeTruthy();
  });
});
