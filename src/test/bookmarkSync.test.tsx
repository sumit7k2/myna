import React from 'react';
import { render, fireEvent, act, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import FeedList from '@/features/feed/FeedList';
import PostDetailScreen from '@/features/post/PostDetailScreen';

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

describe('bookmark state syncing', () => {
  it('toggling bookmark in feed reflects in post detail', async () => {
    const tree = renderWithProviders(
      <>
        <FeedList pageSize={1} testID="feed" />
        <PostDetailScreen route={{ key: 'x', name: 'PostDetail', params: { id: 'p1' } } as any} navigation={{} as any} />
      </>
    );

    // Find the feed container
    const feed = await tree.findByTestId('feed');
    const feedBookmarkBtn = await within(feed).findByTestId('bookmark-p1');

    await act(async () => {
      fireEvent.press(feedBookmarkBtn);
    });

    // After toggling, both feed and detail should show Bookmarked
    const all = tree.getAllByText('Bookmarked');
    expect(all.length).toBeGreaterThanOrEqual(2);
  });
});
