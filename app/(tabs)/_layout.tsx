import { Tabs } from 'expo-router';
import React, { FC } from 'react';
import { Platform } from 'react-native';
import AntDesignIcons from '@expo/vector-icons/AntDesign';

import { HapticTab } from '@/components/HapticTab';
import { type TIconSymbolProps, IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

import { useUserStore } from '@/stores/useUserStore';
import { useWardrobeAutoSync } from '@/stores/useWardrobeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const LoginIcon: FC<{ isLoading: boolean; color: string }> = ({
  isLoading,
  color,
}) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    if (isLoading) {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 900,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      rotation.value = 0;
    }
  }, [isLoading, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (!isLoading) {
    return <AntDesignIcons size={28} name="google" color={color} />;
  }

  return (
    <Animated.View style={style}>
      <AntDesignIcons size={28} name="loading1" color={color} />
    </Animated.View>
  );
};

const getTabs = (): {
  hidden?: boolean;
  name: string;
  title: string;
  withLogin?: boolean;
  icon:
    | TIconSymbolProps['name']
    | ((color: string, isLoading: boolean) => React.ReactNode);
}[] => {
  return [
    {
      name: 'try-on',
      title: 'Try on',
      icon: 'checkroom',
    },
    {
      name: 'garment',
      title: 'Garment',
      icon: 'local-mall',
    },
    {
      name: 'tasks-list',
      title: 'List',
      icon: 'schedule',
    },
    {
      name: 'wardrobe/index',
      title: 'Wardrobe',
      icon: 'grid-view',
      withLogin: true,
    },
    {
      name: 'feedback',
      title: 'Feedback',
      icon: 'feedback',
      hidden: true,
    },
    {
      name: 'profile',
      title: 'User',
      icon: 'person',
      withLogin: true,
    },
    {
      name: 'login',
      title: 'User',
      icon: (color: string, isLoading: boolean) => {
        return <LoginIcon color={color} isLoading={isLoading} />;
      },
      withLogin: false,
    },
    {
      name: 'wardrobe/[id]',
      title: 'wardrobe_id',
      icon: 'account-circle',
      hidden: true,
    },
  ];
};

const MenuIcon = ({
  color,
  icon,
  isLoading,
}: {
  color: string;
  isLoading: boolean;
  icon:
    | TIconSymbolProps['name']
    | ((color: string, isLoading: boolean) => React.ReactNode);
}) => {
  return typeof icon === 'string' ? (
    <IconSymbol size={28} name={icon as any} color={color} />
  ) : (
    icon(color, isLoading)
  );
};

export default function TabLayout() {
  const { user } = useUserStore();
  const { signInWithGoogle, isLoading } = useAuthStore();

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
        const isLoginTab = name === 'login';

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
                <MenuIcon color={color} icon={icon} isLoading={isLoading} />
              ),
            }}
            listeners={
              isLoginTab
                ? {
                    tabPress: (e) => {
                      e.preventDefault();
                      signInWithGoogle();
                    },
                  }
                : undefined
            }
          />
        );
      })}
    </Tabs>
  );
}
