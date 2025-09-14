import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { type IconSymbolName, IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

import { useUserStore } from '@/hooks/useUserStore';
import { useWardrobeAutoSync } from '@/hooks/useWardrobeStore';

const getTabs = (): {
  hidden?: boolean;
  name: string;
  title: string;
  withLogin?: boolean;
  icon: IconSymbolName;
}[] => {
  return [
    {
      name: 'try-on',
      title: 'Try on',
      icon: 'tshirt.fill',
    },
    {
      name: 'garment',
      title: 'Garment',
      icon: 'bag.fill',
    },
    {
      name: 'tasks-list',
      title: 'List',
      icon: 'clock.fill',
    },
    {
      name: 'wardrobe/index',
      title: 'Wardrobe',
      icon: 'square.grid.2x2.fill',
      withLogin: true,
    },
    {
      name: 'profile',
      title: 'User',
      icon: 'person.fill',
      withLogin: true,
    },
    {
      name: 'login',
      title: 'User',
      icon: 'person.crop.circle',
      withLogin: false,
    },
    {
      name: 'wardrobe/[id]',
      title: 'wardrobe_id',
      icon: 'person.crop.circle',
      hidden: true,
    },
  ];
};

export default function TabLayout() {
  const { user } = useUserStore();

  useWardrobeAutoSync();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
        }),
      }}
    >
      {getTabs().map(({ name, title, icon, withLogin, hidden }) => {
        let href = null;
        if (withLogin === false && !user) {
          href = undefined;
        } else if (withLogin === true && !!user) {
          href = undefined;
        } else if (withLogin === undefined) {
          href = undefined;
        }

        if (hidden) href = null;

        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title,
              href,
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name={icon as any} color={color} />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
