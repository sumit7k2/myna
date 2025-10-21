import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const deepLinkPrefixes: string[] = [
  'expotsstarter://',
  'https://expo-ts-starter.example'
];

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: deepLinkPrefixes,
  config: {
    screens: {
      RootTabs: {
        screens: {
          Home: 'home',
          Topics: 'topics',
          Notifications: 'notifications',
          Profile: 'profile',
        },
      },
      Compose: 'compose',
      PostDetail: 'post/:id',
      UserProfile: 'user/:username',
      Settings: 'settings',
      Onboarding: 'onboarding',
      // Auth screens can be deep-linked too
      Login: 'login',
      SignUp: 'signup',
    },
  },
};
