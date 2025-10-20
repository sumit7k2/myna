import React from 'react';
import FollowingScreen from '@/features/home/FollowingScreen';
import ForYouScreen from '@/features/home/ForYouScreen';

// Avoid importing the top tabs library at module scope to keep tests lightweight.
// TS: declare require so we don't need Node types in the project.
declare const require: any;

export default function HomeTabs() {
  // Dynamically require material-top-tabs to avoid hard dependency during tests/build steps
  const { createMaterialTopTabNavigator } = require('@react-navigation/material-top-tabs') as any;
  const TopTab = createMaterialTopTabNavigator();

  return (
    <TopTab.Navigator>
      <TopTab.Screen name="Following" component={FollowingScreen} />
      <TopTab.Screen name="ForYou" component={ForYouScreen} options={{ title: 'For You' }} />
    </TopTab.Navigator>
  );
}
