import React, { useMemo } from 'react';
import { YStack, Paragraph } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { gql, useQuery } from '@apollo/client';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      author
      content
    }
  }
`;

export default function ForYouScreen() {
  const { data } = useQuery<{ posts: { id: string; author: string; content: string }[] }>(GET_POSTS);
  const posts = useMemo(() => data?.posts ?? [], [data]);

  return (
    <YStack f={1} p="$4" gap="$3">
      <FlashList
        data={posts}
        keyExtractor={(item) => item.id}
        estimatedItemSize={64}
        renderItem={({ item }) => (
          <YStack p="$3" bg="$bg" br="$2" mb="$2">
            <Paragraph>{item.author}</Paragraph>
            <Paragraph>{item.content}</Paragraph>
          </YStack>
        )}
      />
    </YStack>
  );
}
