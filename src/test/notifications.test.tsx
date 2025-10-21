import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationsScreen from '@/features/notifications/NotificationsScreen';
import PostDetailScreen from '@/features/post/PostDetailScreen';
import { UserProfileView } from '@/features/profile/ProfileScreen';
import type { RootStackParamList } from '@/navigation/types';

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

function TestNavigator() {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="RootTabs" component={NotificationsScreen as any} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen as any} />
        <Stack.Screen
          name="UserProfile"
          component={({ route }: any) => <UserProfileView username={route.params.username} />}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Providers as any });
}

describe('Notifications center', () => {
  it('renders groups, unread badge, and filter tabs', async () => {
    const { findByTestId, findByText } = renderWithProviders(<TestNavigator />);

    expect(await findByText('Notifications')).toBeTruthy();
    // Unread group present and badge shows count for first page
    const badge = await findByTestId('unread-count');
    expect((badge as any).props.children.join('')).toContain('Unread:');

    // Filter tabs placeholders present
    expect(await findByTestId('tab-all')).toBeTruthy();
    expect(await findByTestId('tab-mentions')).toBeTruthy();
    expect(await findByTestId('tab-follows')).toBeTruthy();
  });

  it('marks all as read and updates unread count', async () => {
    const { findByTestId } = renderWithProviders(<TestNavigator />);

    const badgeBefore = await findByTestId('unread-count');
    const beforeText = String((badgeBefore as any).props.children.join(''));
    expect(beforeText).toMatch(/Unread: \d+/);

    await act(async () => {
      fireEvent.press(await findByTestId('mark-all-read'));
    });

    const badgeAfter = await findByTestId('unread-count');
    const afterText = String((badgeAfter as any).props.children.join(''));
    expect(afterText).toMatch(/Unread: 0/);
  });

  it('loads more notifications with pagination', async () => {
    const { findByTestId, queryByTestId } = renderWithProviders(<TestNavigator />);

    // Load more should be shown initially (there are 6 total, page size 4)
    const loadMoreBtn = await findByTestId('load-more-notifications');
    expect(loadMoreBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(loadMoreBtn);
    });

    // After loading, button should disappear (no more pages)
    expect(queryByTestId('load-more-notifications')).toBeNull();
  });

  it('navigates to post detail from a post-related notification', async () => {
    const { findAllByText, findByText } = renderWithProviders(<TestNavigator />);

    const likeItems = await findAllByText(/liked your post/i);
    expect(likeItems.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(likeItems[0]);
    });

    expect(await findByText('Post Detail')).toBeTruthy();
  });

  it('navigates to user profile from a follow notification', async () => {
    const { findAllByText, findByText } = renderWithProviders(<TestNavigator />);

    const followItems = await findAllByText(/followed you/i);
    expect(followItems.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.press(followItems[0]);
    });

    // Should navigate to Jane's profile
    expect(await findByText('Jane Doe')).toBeTruthy();
  });
});
