import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { YStack, H2, Paragraph, XStack, Button, SizableText, Separator } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { gql, useQuery } from '@apollo/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { Pressable } from 'react-native';

const GET_NOTIFICATIONS = gql`
  query GetNotifications($first: Int!, $after: String) {
    notifications(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          message
          createdAt
          read
          type
          postId
          username
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const PAGE_SIZE = 4;

type Props = NativeStackScreenProps<RootStackParamList, 'RootTabs'> | any;

type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  postId?: string | null;
  username?: string | null;
};

export default function NotificationsScreen({ navigation }: Props) {
  const { data, loading, fetchMore, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true
  });

  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'follows'>('all');
  const [locallyRead, setLocallyRead] = useState<Set<string>>(new Set());

  // Build nodes collection
  const edges = data?.notifications?.edges ?? [];
  const pageInfo = data?.notifications?.pageInfo;
  const nodes: NotificationItem[] = useMemo(() => edges.map((e: any) => e.node), [edges]);

  // Compute read status with local overrides
  const withRead = useMemo(() =>
    nodes.map((n) => ({ ...n, read: n.read || locallyRead.has(n.id) })),
    [nodes, locallyRead]
  );

  const unread = useMemo(() => withRead.filter((n) => !n.read), [withRead]);
  const read = useMemo(() => withRead.filter((n) => n.read), [withRead]);
  const unreadCount = unread.length;

  useEffect(() => {
    // If refetch causes nodes to change, ensure our local overrides still point to existing ids
    const existingIds = new Set(nodes.map((n) => n.id));
    setLocallyRead((cur) => new Set(Array.from(cur).filter((id) => existingIds.has(id))));
  }, [nodes]);

  const markAllAsRead = useCallback(() => {
    setLocallyRead(new Set(nodes.map((n) => n.id)));
  }, [nodes]);

  const onPressItem = useCallback((n: NotificationItem) => {
    setLocallyRead((cur) => new Set(cur).add(n.id));
    if (n.postId) {
      navigation?.navigate?.('PostDetail', { id: n.postId });
    } else if (n.username) {
      navigation?.navigate?.('UserProfile', { username: n.username });
    }
  }, [navigation]);

  const onLoadMore = useCallback(() => {
    if (!pageInfo?.hasNextPage || loading) return;
    fetchMore({ variables: { after: pageInfo?.endCursor, first: PAGE_SIZE } });
  }, [pageInfo?.hasNextPage, pageInfo?.endCursor, loading, fetchMore]);

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Notifications</H2>

      {/* Filter tabs (placeholders) */}
      <XStack gap="$2">
        <Button testID="tab-all" size="$2" onPress={() => setActiveTab('all')}>All</Button>
        <Button testID="tab-mentions" size="$2" onPress={() => setActiveTab('mentions')}>Mentions</Button>
        <Button testID="tab-follows" size="$2" onPress={() => setActiveTab('follows')}>Follows</Button>
      </XStack>
      <Paragraph testID="active-tab">Active tab: {activeTab}</Paragraph>

      <XStack ai="center" gap="$2">
        <SizableText testID="unread-count">Unread: {unreadCount}</SizableText>
        <Button testID="mark-all-read" size="$2" onPress={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
        <Button size="$2" variant="outlined" onPress={() => refetch({ first: PAGE_SIZE, after: null })}>Refresh</Button>
      </XStack>

      <Separator />

      {/* Unread group */}
      {unread.length > 0 ? (
        <YStack testID="group-unread" gap="$2">
          <SizableText>Unread ({unread.length})</SizableText>
          <FlashList
            data={unread}
            keyExtractor={(item) => item.id}
            estimatedItemSize={56}
            renderItem={({ item }) => (
              <>
                <Pressable onPress={() => onPressItem(item)}>
                  <YStack
                    testID={`notification-item-${item.id}`}
                    p="$2"
                    bg="$backgroundStrong"
                    br="$2"
                  >
                    <Paragraph>
                      {item.message}
                    </Paragraph>
                    <XStack ai="center" jc="space-between">
                      <Paragraph size="$2" opacity={0.6}>{new Date(item.createdAt).toLocaleString()}</Paragraph>
                      <Button testID={`mark-read-${item.id}`} size="$2" onPress={() => setLocallyRead((cur) => new Set(cur).add(item.id))}>Mark read</Button>
                    </XStack>
                  </YStack>
                </Pressable>
              </>
            )}
          />
        </YStack>
      ) : null}

      {/* Read group */}
      <YStack testID="group-read" gap="$2">
        <SizableText>Earlier</SizableText>
        <FlashList
          data={read}
          keyExtractor={(item) => item.id}
          estimatedItemSize={56}
          renderItem={({ item }) => (
            <Pressable onPress={() => onPressItem(item)}>
              <YStack
                testID={`notification-item-${item.id}`}
                p="$2"
                bg="$bg"
                br="$2"
              >
                <Paragraph>
                  {item.message}
                </Paragraph>
                <Paragraph size="$2" opacity={0.6}>{new Date(item.createdAt).toLocaleString()}</Paragraph>
              </YStack>
            </Pressable>
          )}
        />
      </YStack>

      {pageInfo?.hasNextPage ? (
        <Button testID="load-more-notifications" onPress={onLoadMore}>Load more</Button>
      ) : null}
    </YStack>
  );
}
