import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { YStack, XStack, Button, H2, Paragraph, Separator } from 'tamagui';
import { FlashList } from '@shopify/flash-list';
import { gql, useQuery } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useScreenView } from '@/hooks/useTelemetry';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      author
      content
    }
  }
`;

type Post = { id: string; author: string; content: string };

type Mode = 'forYou' | 'following';

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mode, setMode] = useState<Mode>('forYou');
  const { data } = useQuery<{ posts: Post[] }>(GET_POSTS);

  const posts = useMemo(() => data?.posts ?? [], [data]);

  useScreenView('Home');

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Home</H2>
      <XStack gap="$2">
        <Button
          size="$3"
          theme={mode === 'forYou' ? 'active' : undefined}
          onPress={() => setMode('forYou')}
          accessibilityRole="button"
          accessibilityLabel="Show For You feed"
        >
          For You
        </Button>
        <Button
          size="$3"
          theme={mode === 'following' ? 'active' : undefined}
          onPress={() => setMode('following')}
          accessibilityRole="button"
          accessibilityLabel="Show Following feed"
        >
          Following
        </Button>
        <Button size="$3" onPress={() => nav.navigate('Compose')} accessibilityRole="button" accessibilityLabel="Open compose screen">
          Compose
        </Button>
        <Button size="$3" onPress={() => nav.navigate('Settings')} accessibilityRole="button" accessibilityLabel="Open settings">
          Settings
        </Button>
      </XStack>
      <Separator />
      {mode === 'forYou' ? (
        <FlashList
          data={posts}
          keyExtractor={(item) => item.id}
          estimatedItemSize={64}
          renderItem={({ item }) => (
            <YStack p="$3" bg="$bg" br="$2" mb="$2">
              <Paragraph>{item.author}</Paragraph>
              <Paragraph>{item.content}</Paragraph>
              <Button
                size="$2"
                onPress={() => nav.navigate('PostDetail', { id: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`Open post by ${item.author}`}
              >
                Open
              </Button>
            </YStack>
          )}
        />
      ) : (
        <View>
          <Paragraph>Following feed is coming soon.</Paragraph>
        </View>
      )}
    </YStack>
  );
}
