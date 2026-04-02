import { Tabs } from 'expo-router';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  const tabBarBaseHeight = isTablet ? 84 : 70;
  const iconSize = isTablet ? 28 : 22;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#555577',
        tabBarActiveBackgroundColor: '#1c1c3a',
        tabBarStyle: {
          backgroundColor: '#0d0d1a',
          borderTopColor: '#2d2d4d',
          borderTopWidth: 1,
          height: tabBarBaseHeight + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 4,
          paddingHorizontal: 6,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: '#1e1e36',
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 20 : 13,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bend Calculator',
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Browse Data',
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={iconSize} name="gearshape" color={color} />,
        }}
      />
    </Tabs>
  );
}
