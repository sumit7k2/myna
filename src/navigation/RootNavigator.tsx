import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, RootTabParamList, AuthStackParamList } from './types';
import HomeTabs from '@/features/home/HomeTabs';
import TopicsScreen from '@/features/topics/TopicsScreen';
import NotificationsScreen from '@/features/notifications/NotificationsScreen';
import ProfileScreen, { UserProfileView } from '@/features/profile/ProfileScreen';
import ComposeScreen from '@/features/compose/ComposeScreen';
import ComposeTriggerScreen from '@/features/compose/ComposeTriggerScreen';
import PostDetailScreen from '@/features/post/PostDetailScreen';
import SettingsScreen from '@/features/settings/SettingsScreen';
import { useColorScheme } from 'react-native';
import { linking } from './linking';
import { useSessionStore } from '@/state/session';
import LoginScreen from '@/features/auth/LoginScreen';
import SignUpScreen from '@/features/auth/SignUpScreen';
import OnboardingScreen from '@/features/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export const ROOT_TABS = ['Home', 'Topics', 'ComposeTrigger', 'Notifications', 'Profile'] as const;
export const ROOT_STACK_SCREENS = ['RootTabs', 'Compose', 'PostDetail', 'UserProfile', 'Settings'] as const;
export const AUTH_STACK_SCREENS = ['Login', 'SignUp'] as const;
export const ONBOARDING_SCREENS = ['Onboarding'] as const;

function RootTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeTabs} />
      <Tab.Screen name="Topics" component={TopicsScreen} />
      <Tab.Screen
        name="ComposeTrigger"
        component={ComposeTriggerScreen}
        options={{ tabBarLabel: 'Compose' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Compose');
          },
        })}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

export default function RootNavigator() {
  const colorScheme = useColorScheme();
  const initialized = useSessionStore((s) => s.initialized);
  const isAuthed = useSessionStore((s) => s.isAuthenticated);
  const needsOnboarding = useSessionStore((s) => !s.onboardingComplete);
  const initialize = useSessionStore((s) => s.initialize);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Background refresh on app focus
  useEffect(() => {
    const sub = (require('react-native') as typeof import('react-native')).AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          // fire and forget
          useSessionStore.getState().backgroundRefresh();
        }
      }
    );
    return () => {
      // RN 0.76 addEventListener returns subscription with remove()
      (sub as any)?.remove?.();
    };
  }, []);

  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme} linking={linking}>
      {!initialized ? (
        <Stack.Navigator>
          <Stack.Screen name="RootTabs" component={RootTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      ) : !isAuthed ? (
        <AuthNavigator />
      ) : needsOnboarding ? (
        <Stack.Navigator>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Onboarding' }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="RootTabs" component={RootTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Compose" component={ComposeScreen} options={{ presentation: 'modal', title: 'Compose' }} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
          <Stack.Screen name="UserProfile" component={({ route }) => <UserProfileView username={route.params.username} />} options={{ title: 'Profile' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
