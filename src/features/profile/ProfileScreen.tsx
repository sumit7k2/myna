import React from 'react';
import { YStack, H2, Paragraph, Button } from 'tamagui';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useThemeStore } from '@/state/theme';

export default function ProfileScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <YStack f={1} p="$4" gap="$3">
      <H2>Profile</H2>
      <Paragraph>Current theme: {theme}</Paragraph>
      <YStack gap="$2">
        <Button onPress={() => setTheme('system')}>System</Button>
        <Button onPress={() => setTheme('light')}>Light</Button>
        <Button onPress={() => setTheme('dark')}>Dark</Button>
      </YStack>
      <Button onPress={() => nav.navigate('Settings')}>Go to Settings</Button>
    </YStack>
  );
}
