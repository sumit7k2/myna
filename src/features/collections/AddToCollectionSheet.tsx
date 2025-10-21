import React, { useMemo } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { YStack, XStack, Button, Paragraph, SizableText } from 'tamagui';
import { useCollectionsStore } from '@/state/collections';
import { useBookmarksStore } from '@/state/bookmarks';

export const GET_COLLECTIONS = gql`
  query GetCollections($userId: ID) {
    collections(userId: $userId) {
      id
      name
      posts(first: 10) {
        edges { cursor node { id } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const ADD_TO_COLLECTION = gql`
  mutation AddToCollection($collectionId: ID!, $postId: ID!) {
    addToCollection(collectionId: $collectionId, postId: $postId) {
      id
      name
      posts(first: 10) {
        edges { cursor node { id } }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export type AddToCollectionSheetProps = {
  postId: string;
  userId?: string;
  onAdded?: (collectionId: string) => void;
};

export function AddToCollectionSheet({ postId, userId, onAdded }: AddToCollectionSheetProps) {
  const { data, loading, refetch } = useQuery(GET_COLLECTIONS, { variables: { userId } });
  const [addToCollection, { loading: adding }] = useMutation(ADD_TO_COLLECTION);

  const collections = useMemo(() => data?.collections ?? [], [data]);

  React.useEffect(() => {
    if (collections.length) {
      useCollectionsStore.getState().hydrateFromQuery(collections as any);
    }
  }, [collections]);

  async function handleAdd(collectionId: string) {
    const res = await addToCollection({ variables: { collectionId, postId } });
    const updated = res?.data?.addToCollection;
    if (updated) {
      useCollectionsStore.getState().hydrateFromQuery([updated]);
      useCollectionsStore.getState().addPostToCollectionLocal(collectionId, postId);
      useBookmarksStore.getState().setBookmarked(postId, true);
      onAdded?.(collectionId);
      await refetch();
    }
  }

  if (loading) {
    return (
      <YStack p="$2"><Paragraph>Loading collections…</Paragraph></YStack>
    );
  }

  return (
    <YStack gap="$2" p="$2">
      <SizableText size="$3">Add to collection</SizableText>
      {collections.map((c: any) => (
        <XStack key={c.id} ai="center" jc="space-between" bg="$bg" p="$2" br="$2">
          <Paragraph>{c.name}</Paragraph>
          <Button testID={`add-to-${c.id}`} size="$2" onPress={() => handleAdd(c.id)} disabled={adding}>
            Add
          </Button>
        </XStack>
      ))}
    </YStack>
  );
}

export default AddToCollectionSheet;
