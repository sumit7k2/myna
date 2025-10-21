import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { YStack, XStack, Button, Paragraph, SizableText } from 'tamagui';
import { TextInput } from 'react-native';
import { useCollectionsStore } from '@/state/collections';

export const CREATE_COLLECTION = gql`
  mutation CreateCollection($name: String!) {
    createCollection(name: $name) { id name }
  }
`;

export function CollectionCreateForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const [name, setName] = useState('');
  const [createCollection, { loading, error }] = useMutation(CREATE_COLLECTION);

  async function onSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await createCollection({ variables: { name: trimmed } });
    const id = res?.data?.createCollection?.id as string | undefined;
    const createdName = res?.data?.createCollection?.name as string | undefined;
    if (id && createdName) {
      useCollectionsStore.getState().createLocalCollection(id, createdName);
      onCreated?.(id);
      setName('');
    }
  }

  return (
    <YStack gap="$2">
      <SizableText size="$3">Create a collection</SizableText>
      <TextInput
        testID="collection-name-input"
        value={name}
        onChangeText={setName}
        placeholder="Collection name"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
      />
      {error ? <Paragraph testID="create-error">{String(error.message || error)}</Paragraph> : null}
      <XStack gap="$2">
        <Button testID="create-collection" size="$2" onPress={onSubmit} disabled={loading || !name.trim()}>
          Create
        </Button>
      </XStack>
    </YStack>
  );
}

export default CollectionCreateForm;
