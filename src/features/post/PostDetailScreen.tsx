import React from 'react';
import { YStack, H2, Paragraph } from 'tamagui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export default function PostDetailScreen({ route }: Props) {
  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Post Detail</H2>
      <Paragraph>Post id: {route.params.id}</Paragraph>
    </YStack>
  );
}
