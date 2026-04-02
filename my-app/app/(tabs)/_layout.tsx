import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
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
          height: 96,
          paddingBottom: 12,
          paddingTop: 6,
          paddingHorizontal: 6,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
          borderWidth: 1,
          borderColor: '#1e1e36',
        },
        tabBarLabelStyle: {
          fontSize: 18,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bend Calculator',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Browse Data',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape" color={color} />,
        }}
      />
    </Tabs>
  );
}
