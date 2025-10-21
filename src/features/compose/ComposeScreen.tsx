import React, { useEffect, useMemo, useState } from 'react';
import { YStack, H2, Paragraph, Button, Image as TImage, XStack, Separator, ScrollView } from 'tamagui';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';
import { gql, useMutation } from '@apollo/client';
import splitIntoThreadParts from './splitIntoThreadParts';
import { enqueue } from './offlineQueue';
import { getItem, setItem } from '@/lib/storage';

const DRAFT_KEY = 'compose.draft';
const MAX_CHARS = 500;

const REWRITE_POST = gql`
  mutation RewritePost($input: RewriteInput!) {
    rewritePost(input: $input) {
      content
      confidence
    }
  }
`;

export default function ComposeScreen() {
  const [text, setText] = useState<string>('');
  const [media, setMedia] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [rewritePost, { loading: rewriting } ] = useMutation(REWRITE_POST);

  // Load draft on mount
  useEffect(() => {
    const draft = getItem<string>(DRAFT_KEY, '');
    if (draft) setText(draft);
  }, []);

  // Persist draft on change
  useEffect(() => {
    setItem<string>(DRAFT_KEY, text);
  }, [text]);

  const parts = useMemo(() => splitIntoThreadParts(text, MAX_CHARS), [text]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) {
      const uri = res.assets[0]?.uri ?? null;
      if (uri) setMedia((m) => [uri, ...m]);
    }
  }

  function onChangeText(v: string) {
    if (v.length <= MAX_CHARS) {
      setText(v);
    } else {
      setText(v.slice(0, MAX_CHARS));
    }
  }

  async function onRewrite() {
    if (!text.trim()) return;
    const { data } = await rewritePost({ variables: { input: { content: text } } });
    const proposed = data?.rewritePost?.content as string | undefined;
    if (proposed) setSuggestion(proposed);
  }

  function acceptSuggestion() {
    if (!suggestion) return;
    const next = suggestion.slice(0, MAX_CHARS);
    setText(next);
    setSuggestion(null);
  }

  function dismissSuggestion() {
    setSuggestion(null);
  }

  function onPost() {
    const currentParts = splitIntoThreadParts(text, MAX_CHARS);
    enqueue(text, currentParts, media);
    setText('');
    setMedia([]);
    setItem<string>(DRAFT_KEY, '');
  }

  const disablePost = text.trim().length === 0;

  return (
    <ScrollView>
      <YStack f={1} p="$4" gap="$3">
        <H2>Compose</H2>
        <Paragraph>Write something or add images. Limit {MAX_CHARS} characters. Media does not affect the limit.</Paragraph>

        <TextInput
          testID="compose-input"
          accessibilityLabel="Compose input"
          placeholder="Write your post..."
          value={text}
          onChangeText={onChangeText}
          multiline
          style={{
            minHeight: 120,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            borderRadius: 6
          }}
        />

        <XStack ai="center" jc="space-between">
          <Paragraph testID="char-counter">{text.length} / {MAX_CHARS}</Paragraph>
          <Button testID="ai-rewrite-btn" disabled={!text.trim() || rewriting} onPress={onRewrite}>
            {rewriting ? 'Rewriting…' : 'Rewrite with AI'}
          </Button>
        </XStack>

        {suggestion ? (
          <YStack gap="$2" p="$2" bc="$backgroundStrong" br="$2" testID="ai-suggestion">
            <Paragraph>AI Suggestion</Paragraph>
            <Paragraph>{suggestion}</Paragraph>
            <XStack gap="$2">
              <Button testID="ai-accept" onPress={acceptSuggestion}>Accept</Button>
              <Button testID="ai-dismiss" onPress={dismissSuggestion} variant="outlined">Dismiss</Button>
            </XStack>
          </YStack>
        ) : null}

        <Separator />

        <XStack gap="$2">
          <Button testID="add-image-btn" onPress={pickImage}>Add image</Button>
          <Button testID="post-btn" disabled={disablePost} onPress={onPost}>Post</Button>
        </XStack>

        {media.length > 0 ? (
          <YStack gap="$2">
            <Paragraph>Media attachments: {media.length}</Paragraph>
            <XStack gap="$2" fw="wrap">
              {media.map((m) => (
                <TImage key={m} source={{ uri: m }} width={80} height={80} resizeMode="cover" />
              ))}
            </XStack>
          </YStack>
        ) : null}

        <Separator />

        <YStack testID="thread-preview" gap="$2">
          <Paragraph>Thread preview: {parts.length || 1} part(s)</Paragraph>
          {parts.map((p, i) => (
            <YStack key={i} p="$2" bc="$backgroundStrong" br="$2">
              <Paragraph>{`Part ${i + 1} — ${p.length} chars`}</Paragraph>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
