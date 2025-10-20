import React from 'react';
import { YStack, H2, Paragraph, Button } from 'tamagui';
import { requestNotificationPermission } from '@/lib/notifications';

export default function SettingsScreen() {
  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Settings</H2>
      <Paragraph>General app settings.</Paragraph>
      <Button onPress={requestNotificationPermission}>Request Notifications Permission</Button>
    </YStack>
  );
}
