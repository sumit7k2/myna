import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { gql, useQuery } from '@apollo/client';
import { YStack } from 'tamagui';
import PostCard, { PostCardFragment } from '@/features/post/PostCard';
import { useRecipeStore } from '@/state/recipe';
import RecipeSlider from '@/features/feed/RecipeSlider';

const GET_FEED = gql`
  query GetFeed($first: Int!, $after: String) {
    feed(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          content
          createdAt
          likesCount
          viewerHasLiked
          author { id username name avatarUrl }
          topics { id name slug }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

export type FeedListProps = {
  pageSize?: number;
  testID?: string;
  feedType?: 'forYou' | 'following';
};

export default function FeedList({ pageSize = 10, testID, feedType = 'forYou' }: FeedListProps) {
  const [refreshing, setRefreshing] = useState(false);
  const { data, loading, fetchMore, refetch } = useQuery(GET_FEED, {
    variables: { first: pageSize },
    notifyOnNetworkStatusChange: true
  });

  const edges = data?.feed?.edges ?? [];
  const pageInfo = data?.feed?.pageInfo;
  const items: PostCardFragment[] = useMemo(() => edges.map((e: any) => e.node), [edges]);
  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    // keep a lightweight feed cache in zustand for offline hydration and slider
    const page = data?.feed;
    if (page) {
      useRecipeStore.getState().mergeFeedPage(feedType, page as any);
    }
  }, [data, feedType]);

  const onEndReached = useCallback(() => {
    if (!pageInfo?.hasNextPage || loading) return;
    fetchMore({ variables: { after: pageInfo?.endCursor, first: pageSize } });
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, loading, fetchMore, pageSize]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const res = await refetch({ first: pageSize, after: null });
    const page = res?.data?.feed;
    if (page) {
      useRecipeStore.getState().refreshFeed(feedType, page as any);
    }
    setRefreshing(false);
  }, [refetch, pageSize, feedType]);

  // Skeleton list when first loading
  if (loading && items.length === 0) {
    return (
      <YStack f={1} p="$4">
        <FlashList
          data={Array.from({ length: pageSize }).map((_, i) => i)}
          keyExtractor={(i) => `skeleton-${i}`}
          estimatedItemSize={64}
          renderItem={() => <PostCard loading />}
        />
      </YStack>
    );
  }

  return (
    <YStack f={1} p="$4">
      <FlashList
        testID={testID}
        data={items}
        keyExtractor={(item) => item.id}
        estimatedItemSize={64}
        onEndReachedThreshold={0.8}
        onEndReached={onEndReached}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item, index }) => (
          <PostCard post={item} onPress={() => useRecipeStore.getState().openSlider(ids, index)} />
        )}
      />
      <RecipeSlider />
    </YStack>
  );
}
