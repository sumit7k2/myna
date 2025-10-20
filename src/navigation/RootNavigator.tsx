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
import PostDetailScreen from '@/features/post/PostDetailScreen';
import SettingsScreen from '@/features/settings/SettingsScreen';
import { useColorScheme } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function RootTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Topics" component={TopicsScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const colorScheme = useColorScheme();
  return (
    <NavigationContainer theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen name="RootTabs" component={RootTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Compose" component={ComposeScreen} options={{ presentation: 'modal', title: 'Compose' }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
