import { Tabs } from 'expo-router';
import React, { FC } from 'react';
import AntDesignIcons from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';

import { useUserStore } from '@/stores/useUserStore';
import { useWardrobeAutoSync } from '@/stores/useWardrobeStore';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const getTabs = ({
  signedIn,
}: {
  signedIn: boolean;
}): {
  hidden?: boolean;
  name: string;
  title: string;
  withLogin?: boolean;
  icon?: (color: string, isLoading?: boolean) => React.ReactNode;
}[] => {
  return [
    {
      name: 'try-on',
      title: 'Try on',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="checkroom" color={color} />;
      },
    },
    {
      name: 'garment',
      title: 'Garment',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="local-mall" color={color} />;
      },
    },
    {
      name: 'tasks-list',
      title: 'List',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="schedule" color={color} />;
      },
    },
    {
      name: 'wardrobe/index',
      title: 'Wardrobe',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="grid-view" color={color} />;
      },
      withLogin: true,
    },
    {
      name: 'feedback',
      title: 'Feedback',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="feedback" color={color} />;
      },
      hidden: true,
    },
    {
      name: 'profile',
      title: signedIn ? 'User' : 'Login in',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="person" color={color} />;
      },
    },
    {
      name: 'login',
      title: 'User',
      hidden: true,
    },
    {
      name: 'wardrobe/[id]',
      title: 'wardrobe_id',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="account-circle" color={color} />;
      },
      hidden: true,
    },
  ];
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const { user } = useUserStore();

  useWardrobeAutoSync();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: 0,
          height: insets.bottom > 30 ? 60 : 80,
        },
      }}
    >
      {getTabs({ signedIn: !!user }).map(
        ({ name, title, icon, withLogin, hidden }) => {
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
                tabBarIcon: ({ color }) => (icon ? icon(color) : null),
              }}
            />
          );
        },
      )}
    </Tabs>
  );
}
