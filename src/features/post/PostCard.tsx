import React from 'react';
import { Pressable, AccessibilityRole } from 'react-native';
import { YStack, Paragraph, XStack, Button, SizableText } from 'tamagui';
import { gql, useMutation } from '@apollo/client';

export type UserPreview = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
};

export type TopicItem = {
  id: string;
  name: string;
  slug: string;
};

export type PostCardFragment = {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  author: UserPreview;
  topics: TopicItem[];
};

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
      viewerHasLiked
      likesCount
    }
  }
`;

export type PostCardProps = {
  post?: PostCardFragment;
  loading?: boolean;
  onPress?: () => void;
  accessibilityRole?: AccessibilityRole;
};

export function PostCard({ post, loading, onPress, accessibilityRole = 'button' }: PostCardProps) {
  const [likePost] = useMutation(LIKE_POST);

  if (loading) {
    return (
      <YStack p="$3" bg="$bg" br="$2" mb="$2" accessibilityLabel="Loading post">
        <SizableText size="$3" opacity={0.5}>
          Loading…
        </SizableText>
      </YStack>
    );
  }

  if (!post) return null;

  const label = `Post by ${post.author?.name ?? 'Unknown'}: ${post.content?.slice(0, 40)}`;

  return (
    <Pressable accessibilityRole={accessibilityRole} accessibilityLabel={label} onPress={onPress}>
      <YStack p="$3" bg="$bg" br="$2" mb="$2">
        <Paragraph>{post.author?.name}</Paragraph>
        <Paragraph>{post.content}</Paragraph>
        <XStack ai="center" jc="space-between" mt="$2">
          <Paragraph accessibilityLabel={`Likes count ${post.likesCount}`}>{post.likesCount} likes</Paragraph>
          <Button
            size="$2"
            accessibilityLabel={post.viewerHasLiked ? 'Unlike' : 'Like'}
            onPress={() =>
              likePost({
                variables: { postId: post.id },
                optimisticResponse: {
                  likePost: {
                    __typename: 'Post',
                    id: post.id,
                    viewerHasLiked: !post.viewerHasLiked,
                    likesCount: post.likesCount + (post.viewerHasLiked ? -1 : 1)
                  }
                }
              })
            }
          >
            {post.viewerHasLiked ? 'Unlike' : 'Like'}
          </Button>
        </XStack>
      </YStack>
    </Pressable>
  );
}

export default PostCard;
