import React, { useMemo, useState } from 'react';
import { YStack, H2, Paragraph, XStack, Button, Separator, SizableText } from 'tamagui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { gql, useMutation, useQuery } from '@apollo/client';
import PostCard, { type PostCardFragment } from './PostCard';
import { TextInput } from 'react-native';

const GET_POST = gql`
  query GetPost($id: ID!, $first: Int!, $after: String) {
    post(id: $id) {
      id
      content
      createdAt
      likesCount
      viewerHasLiked
      author { id username name avatarUrl }
      topics { id name slug }
      replyCount
      viewerCanReply
      replyRationale
      replies(first: $first, after: $after) {
        edges { cursor node { id content createdAt likesCount viewerHasLiked author { id username name avatarUrl } postId } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const LIKE_REPLY = gql`
  mutation LikeReply($replyId: ID!) {
    likeReply(replyId: $replyId) { id likesCount viewerHasLiked }
  }
`;

const CREATE_REPLY = gql`
  mutation CreateReply($postId: ID!, $content: String!) {
    createReply(postId: $postId, content: $content) {
      id
      postId
      content
      createdAt
      likesCount
      viewerHasLiked
      author { id username name avatarUrl }
    }
  }
`;

const PAGE_SIZE = 5;

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

type Reply = {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  author: { id: string; name: string; username: string };
  __optimistic?: boolean;
};

export default function PostDetailScreen({ route }: Props) {
  const postId = route.params.id;
  const { data, loading, fetchMore, refetch } = useQuery(GET_POST, {
    variables: { id: postId, first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true
  });
  const [likeReply] = useMutation(LIKE_REPLY);
  const [createReply] = useMutation(CREATE_REPLY);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeText, setComposeText] = useState('');
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const [pendingReplies, setPendingReplies] = useState<Reply[]>([]);

  const post = data?.post as (PostCardFragment & {
    replyCount: number;
    viewerCanReply: boolean;
    replyRationale?: string | null;
    replies: { edges: { cursor: string; node: Reply }[]; pageInfo: { hasNextPage: boolean; endCursor?: string | null } };
  }) | undefined;

  const replies: Reply[] = useMemo(() => {
    const nodes: Reply[] = (post?.replies?.edges ?? []).map((e) => e.node);
    return [...pendingReplies, ...nodes];
  }, [post?.replies?.edges, pendingReplies]);

  if (loading && !post) {
    return (
      <YStack f={1} p="$4" gap="$3">
        <SizableText size="$3" opacity={0.5}>Loading…</SizableText>
      </YStack>
    );
  }

  if (!post) {
    return (
      <YStack f={1} p="$4" gap="$3">
        <Paragraph>Post not found</Paragraph>
      </YStack>
    );
  }

  function onOpenCompose() {
    if (!post.viewerCanReply) {
      setBlockedReason(post.replyRationale || 'You cannot reply to this post');
      setComposeOpen(false);
      return;
    }
    setBlockedReason(null);
    setComposeOpen(true);
  }

  async function onSendReply() {
    const text = composeText.trim();
    if (!text) return;
    const optimistic: Reply = {
      id: `temp-${Date.now()}`,
      postId,
      content: text,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      viewerHasLiked: false,
      author: post.author,
      __optimistic: true
    };
    setPendingReplies((cur) => [optimistic, ...cur]);
    setComposeText('');
    setComposeOpen(false);

    try {
      await createReply({
        variables: { postId, content: text },
        optimisticResponse: {
          createReply: {
            __typename: 'Reply',
            id: optimistic.id,
            postId,
            content: text,
            createdAt: optimistic.createdAt,
            likesCount: 0,
            viewerHasLiked: false,
            author: post.author
          }
        }
      });
      setPendingReplies((cur) => cur.filter((r) => r.id !== optimistic.id));
      await refetch({ id: postId, first: PAGE_SIZE });
    } catch {
      // revert optimistic
      setPendingReplies((cur) => cur.filter((r) => r.id !== optimistic.id));
    }
  }

  function onLikeReply(r: Reply) {
    likeReply({
      variables: { replyId: r.id },
      optimisticResponse: {
        likeReply: {
          __typename: 'Reply',
          id: r.id,
          likesCount: r.likesCount + (r.viewerHasLiked ? -1 : 1),
          viewerHasLiked: !r.viewerHasLiked
        }
      }
    });
  }

  const hasMore = !!post.replies?.pageInfo?.hasNextPage;
  const endCursor = post.replies?.pageInfo?.endCursor;

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Post Detail</H2>
      <PostCard post={post as any} accessibilityRole="none" />

      <XStack ai="center" gap="$2">
        <Button testID="open-reply-compose" size="$2" onPress={onOpenCompose}>Reply</Button>
        <Paragraph>Replies: {post.replyCount + pendingReplies.length}</Paragraph>
      </XStack>

      {blockedReason ? (
        <Paragraph testID="reply-blocked">{blockedReason}</Paragraph>
      ) : null}

      {composeOpen ? (
        <YStack gap="$2" p="$2" bc="$backgroundStrong" br="$2">
          <TextInput
            testID="reply-input"
            value={composeText}
            onChangeText={setComposeText}
            placeholder="Write a reply…"
            style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
          />
          <XStack gap="$2">
            <Button testID="send-reply" size="$2" onPress={onSendReply} disabled={!composeText.trim()}>
              Post reply
            </Button>
            <Button size="$2" variant="outlined" onPress={() => setComposeOpen(false)}>
              Cancel
            </Button>
          </XStack>
        </YStack>
      ) : null}

      <Separator />

      <YStack gap="$2">
        {replies.map((r) => (
          <YStack key={r.id} testID={`reply-item-${r.id}`} p="$2" bg="$bg" br="$2" gap="$1">
            <Paragraph>{r.author?.name}</Paragraph>
            <Paragraph>{r.content}</Paragraph>
            <XStack ai="center" jc="space-between">
              <Paragraph testID={`reply-like-count-${r.id}`}>{r.likesCount} likes</Paragraph>
              <Button
                testID={`reply-like-btn-${r.id}`}
                size="$2"
                onPress={() => onLikeReply(r)}
                accessibilityLabel={r.viewerHasLiked ? 'Unlike reply' : 'Like reply'}
              >
                {r.viewerHasLiked ? 'Unlike' : 'Like'}
              </Button>
            </XStack>
          </YStack>
        ))}
      </YStack>

      {hasMore ? (
        <Button
          testID="load-more-replies"
          onPress={() => fetchMore({ variables: { id: postId, first: PAGE_SIZE, after: endCursor } })}
        >
          Load more
        </Button>
      ) : null}
    </YStack>
  );
}
