import React from 'react';
import { YStack, H2, Paragraph, Button } from 'tamagui';
import { requestNotificationPermission } from '@/lib/notifications';
import { useSessionStore } from '@/state/session';

export default function SettingsScreen() {
  const signOut = useSessionStore((s) => s.signOut);
  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Settings</H2>
      <Paragraph>General app settings.</Paragraph>
      <Button onPress={requestNotificationPermission}>Request Notifications Permission</Button>
      <Button theme="red" onPress={signOut}>Sign Out</Button>
    </YStack>
  );
}
