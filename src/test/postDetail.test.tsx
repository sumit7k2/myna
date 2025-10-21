import React from 'react';
import { render, fireEvent, act, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import PostDetailScreen from '@/features/post/PostDetailScreen';
import FeedList from '@/features/feed/FeedList';
import { setScenario } from '@/mocks/fixtures/scenario';

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

describe('PostDetail thread, replies and interactions', () => {
  it('loads replies with pagination and can load more', async () => {
    const { findByText, getByTestId, queryByText } = renderWithProviders(
      <PostDetailScreen route={{ key: 'x', name: 'PostDetail', params: { id: 'p1' } } as any} navigation={{} as any} />
    );

    // First page shows reply 1..5
    expect(await findByText('Reply 1 to p1')).toBeTruthy();
    expect(queryByText('Reply 6 to p1')).toBeNull();

    await act(async () => {
      fireEvent.press(getByTestId('load-more-replies'));
    });

    expect(await findByText('Reply 6 to p1')).toBeTruthy();
  });

  it('optimistically likes a reply', async () => {
    const { findByTestId, getByTestId } = renderWithProviders(
      <PostDetailScreen route={{ key: 'x', name: 'PostDetail', params: { id: 'p1' } } as any} navigation={{} as any} />
    );

    const likeCountEl = await findByTestId('reply-like-count-rp1-1');
    const beforeText = (likeCountEl as any).props.children[0] ?? (likeCountEl as any).props.children;
    const before = typeof beforeText === 'number' ? beforeText : parseInt(String(beforeText), 10);

    await act(async () => {
      fireEvent.press(getByTestId('reply-like-btn-rp1-1'));
    });

    const afterText = (likeCountEl as any).props.children[0] ?? (likeCountEl as any).props.children;
    const after = typeof afterText === 'number' ? afterText : parseInt(String(afterText), 10);

    expect(after === before + 1 || after === before - 1).toBe(true);
  });

  it('enforces reply controls with rationale', async () => {
    setScenario('limitedReplies');
    const { getByTestId, findByTestId } = renderWithProviders(
      <PostDetailScreen route={{ key: 'x', name: 'PostDetail', params: { id: 'p1' } } as any} navigation={{} as any} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('open-reply-compose'));
    });

    const reason = await findByTestId('reply-blocked');
    expect(reason).toHaveTextContent('Only followers can reply');
  });

  it('opens compose sheet and posts a reply optimistically', async () => {
    const { getByTestId, findByText, queryByTestId } = renderWithProviders(
      <PostDetailScreen route={{ key: 'x', name: 'PostDetail', params: { id: 'p1' } } as any} navigation={{} as any} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('open-reply-compose'));
    });

    const input = getByTestId('reply-input');
    await act(async () => {
      fireEvent.changeText(input, 'New reply from test');
    });

    await act(async () => {
      fireEvent.press(getByTestId('send-reply'));
    });

    expect(queryByTestId('reply-input')).toBeNull();
    expect(await findByText('New reply from test')).toBeTruthy();
  });

  it('liking the post in detail updates the feed cache', async () => {
    const tree = renderWithProviders(
      <>
        <FeedList pageSize={1} testID="feed" />
        <PostDetailScreen route={{ key: 'x', name: 'PostDetail', params: { id: 'p1' } } as any} navigation={{} as any} />
      </>
    );

    const feed = await tree.findByTestId('feed');
    const likeCountNode = await within(feed).findByA11yLabel(/Likes count/);
    const beforeText = (likeCountNode as any).props.accessibilityLabel as string;
    const before = parseInt(beforeText.replace(/[^0-9]/g, ''), 10);

    // Find the detail like button (exclude the one from feed)
    const allLikeButtons = tree.getAllByA11yLabel(/^(Like|Unlike)$/);
    const feedLikeButton = within(feed).getByA11yLabel(/^(Like|Unlike)$/);
    const detailLikeButton = allLikeButtons.find((b) => b !== feedLikeButton)!;

    await act(async () => {
      fireEvent.press(detailLikeButton);
    });

    const afterNode = await within(feed).findByA11yLabel(/Likes count/);
    const afterText = (afterNode as any).props.accessibilityLabel as string;
    const after = parseInt(afterText.replace(/[^0-9]/g, ''), 10);

    // should change by +/- 1 optimistically
    expect(after === before + 1 || after === before - 1).toBe(true);
  });
});
