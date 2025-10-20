import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList, RootTabParamList } from './types';
import HomeScreen from '@/features/home/HomeScreen';
import TopicsScreen from '@/features/topics/TopicsScreen';
import NotificationsScreen from '@/features/notifications/NotificationsScreen';
import ProfileScreen from '@/features/profile/ProfileScreen';
import ComposeScreen from '@/features/compose/ComposeScreen';
import ComposeTriggerScreen from '@/features/compose/ComposeTriggerScreen';
import PostDetailScreen from '@/features/post/PostDetailScreen';
import SettingsScreen from '@/features/settings/SettingsScreen';
import { useColorScheme } from 'react-native';
import { linking } from './linking';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

export const ROOT_TABS = ['Home', 'Topics', 'ComposeTrigger', 'Notifications', 'Profile'] as const;
export const ROOT_STACK_SCREENS = ['RootTabs', 'Compose', 'PostDetail', 'Settings'] as const;

function RootTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
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

export default function RootNavigator() {
  const colorScheme = useColorScheme();
  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme} linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="RootTabs" component={RootTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Compose" component={ComposeScreen} options={{ presentation: 'modal', title: 'Compose' }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
