import React from 'react';
import { YStack, H2, Paragraph } from 'tamagui';

export default function NotificationsScreen() {
  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Notifications</H2>
      <Paragraph>Notifications will appear here.</Paragraph>
    </YStack>
  );
}
