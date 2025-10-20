import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  RootTabs: NavigatorScreenParams<RootTabParamList>;
  Compose: undefined;
  PostDetail: { id: string };
  Settings: undefined;
  Onboarding: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Topics: undefined;
  ComposeTrigger: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type HomeTopTabParamList = {
  Following: undefined;
  ForYou: undefined;
};
