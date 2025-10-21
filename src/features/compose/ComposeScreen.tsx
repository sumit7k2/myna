import React, { useEffect, useMemo, useState } from 'react';
import { YStack, H2, Paragraph, Button, Image as TImage, XStack, Separator, ScrollView } from 'tamagui';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';
import { gql, useMutation } from '@apollo/client';
import splitIntoThreadParts from './splitIntoThreadParts';
import { enqueue } from './offlineQueue';
import { getItem, setItem } from '@/lib/storage';
import { uploadToPresignedUrl } from './uploadAdapter';

const DRAFT_KEY = 'compose.draft';
const MAX_CHARS = 500;
const MAX_ATTACHMENTS = 4;

type Attachment = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  progress?: number;
};

type ComposeDraft = {
  text: string;
  media: Attachment[];
};

const REWRITE_POST = gql`
  mutation RewritePost($input: RewriteInput!) {
    rewritePost(input: $input) {
      content
      confidence
    }
  }
`;

function randomId(prefix = 'att') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function ComposeScreen() {
  const [text, setText] = useState<string>('');
  const [media, setMedia] = useState<Attachment[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [rewritePost, { loading: rewriting } ] = useMutation(REWRITE_POST);

  // Load draft on mount
  useEffect(() => {
    const draft = getItem<ComposeDraft | string | null>(DRAFT_KEY, null);
    if (typeof draft === 'string') {
      setText(draft);
    } else if (draft && typeof draft === 'object') {
      setText(draft.text || '');
      setMedia(Array.isArray(draft.media) ? draft.media : []);
    }
  }, []);

  // Persist draft on change
  useEffect(() => {
    const payload: ComposeDraft = { text, media };
    setItem<ComposeDraft>(DRAFT_KEY, payload);
  }, [text, media]);

  const parts = useMemo(() => splitIntoThreadParts(text, MAX_CHARS), [text]);

  async function ensureMediaLibraryPermission(): Promise<boolean> {
    const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return (res as any)?.granted ?? ((res as any)?.status === 'granted');
  }

  async function ensureCameraPermission(): Promise<boolean> {
    const res = await ImagePicker.requestCameraPermissionsAsync();
    return (res as any)?.granted ?? ((res as any)?.status === 'granted');
  }

  async function pickImage() {
    if (media.length >= MAX_ATTACHMENTS) return;
    const ok = await ensureMediaLibraryPermission();
    if (!ok) return;

    const remaining = MAX_ATTACHMENTS - media.length;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true as any,
      selectionLimit: remaining as any
    } as any);
    if (!res.canceled) {
      const toAdd = (res.assets || [])
        .slice(0, remaining)
        .map((a) => ({ id: randomId(), uri: a.uri, type: 'image' as const }));
      setMedia((m) => [...m, ...toAdd]);
    }
  }

  async function takePhoto() {
    if (media.length >= MAX_ATTACHMENTS) return;
    const ok = await ensureCameraPermission();
    if (!ok) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) {
      const uri = res.assets?.[0]?.uri;
      if (uri) setMedia((m) => [...m, { id: randomId(), uri, type: 'image' }]);
    }
  }

  function moveAttachment(index: number, dir: -1 | 1) {
    setMedia((m) => {
      const next = m.slice();
      const target = index + dir;
      if (target < 0 || target >= next.length) return m;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  }

  function removeAttachment(index: number) {
    setMedia((m) => m.filter((_, i) => i !== index));
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

  async function onPost() {
    const currentParts = splitIntoThreadParts(text, MAX_CHARS);

    // Simulate presigned URL uploads with progress UI
    if (media.length > 0) {
      setUploading(true);
      const updated: Attachment[] = media.map((m) => ({ ...m, progress: 0 }));
      setMedia(updated);

      await Promise.all(
        updated.map(async (att, idx) => {
          const destUrl = `https://uploads.example.com/${att.id}`;
          await uploadToPresignedUrl(att.uri, destUrl, (p) => {
            setMedia((cur) => {
              const next = cur.slice();
              if (next[idx]) next[idx] = { ...next[idx], progress: p };
              return next;
            });
          });
        })
      );
      setUploading(false);
    }

    enqueue(text, currentParts, media.map((m) => m.uri));
    setText('');
    setMedia([]);
    setItem<ComposeDraft>(DRAFT_KEY, { text: '', media: [] });
  }

  const disablePost = text.trim().length === 0 || uploading;

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
          <Button testID="add-image-btn" disabled={media.length >= MAX_ATTACHMENTS} onPress={pickImage}>Add image</Button>
          <Button testID="add-camera-btn" disabled={media.length >= MAX_ATTACHMENTS} onPress={takePhoto}>Take photo</Button>
          <Button testID="post-btn" disabled={disablePost} onPress={onPost}>{uploading ? 'Posting…' : 'Post'}</Button>
        </XStack>

        {media.length > 0 ? (
          <YStack gap="$2">
            <Paragraph>Media attachments: {media.length}</Paragraph>
            <XStack gap="$2" fw="wrap">
              {media.map((m, i) => (
                <YStack key={m.id} ai="center" gap="$2">
                  <TImage source={{ uri: m.uri }} width={80} height={80} resizeMode="cover" />
                  {typeof m.progress === 'number' ? (
                    <Paragraph testID={`upload-progress-${i}`}>{Math.round((m.progress || 0) * 100)}%</Paragraph>
                  ) : null}
                  <XStack gap="$1">
                    <Button testID={`move-left-${i}`} disabled={i === 0} onPress={() => moveAttachment(i, -1)}>◀︎</Button>
                    <Button testID={`move-right-${i}`} disabled={i === media.length - 1} onPress={() => moveAttachment(i, 1)}>▶︎</Button>
                    <Button testID={`remove-${i}`} onPress={() => removeAttachment(i)}>Remove</Button>
                  </XStack>
                  <Paragraph testID={`attachment-uri-${i}`}>{m.uri}</Paragraph>
                </YStack>
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
