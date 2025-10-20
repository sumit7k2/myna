import React from 'react';
import { YStack, H2, Paragraph } from 'tamagui';

export default function TopicsScreen() {
  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Topics</H2>
      <Paragraph>Explore topics here.</Paragraph>
    </YStack>
  );
}
