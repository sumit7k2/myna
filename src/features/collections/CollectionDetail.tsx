import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { YStack, H2, Paragraph, Button } from 'tamagui';
import { GET_COLLECTIONS } from './AddToCollectionSheet';
import { getCollectionShareLink } from './share';

export function CollectionDetail({ id }: { id: string }) {
  const { data, loading, refetch } = useQuery(GET_COLLECTIONS, { variables: {} });
  const collection = useMemo(() => (data?.collections ?? []).find((c: any) => c.id === id), [data, id]);

  if (loading && !collection) {
    return (
      <YStack f={1} p="$4"><Paragraph>Loading…</Paragraph></YStack>
    );
  }

  if (!collection) {
    return (
      <YStack f={1} p="$4"><Paragraph>Collection not found</Paragraph></YStack>
    );
  }

  const postCount = collection?.posts?.edges?.length ?? 0;

  return (
    <YStack f={1} p="$4" gap="$2">
      <H2>{collection.name}</H2>
      <Paragraph>{postCount} posts</Paragraph>
      <Button testID="share-collection" size="$2" onPress={() => getCollectionShareLink(collection.id)}>Share</Button>
      <YStack gap="$1">
        {(collection.posts?.edges ?? []).map((e: any) => (
          <Paragraph key={e.node.id}>Post {e.node.id}</Paragraph>
        ))}
      </YStack>
    </YStack>
  );
}

export default CollectionDetail;
