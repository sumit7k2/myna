import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  RootTabs: NavigatorScreenParams<RootTabParamList>;
  Compose: undefined;
  PostDetail: { id: string };
  Settings: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Topics: undefined;
  ComposeTrigger: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type HomeTopTabParamList = {
  Following: undefined;
  ForYou: undefined;
};
