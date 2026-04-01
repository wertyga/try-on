import { Tabs, router, usePathname } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useCustomOutfitGuard } from '@/hooks';

import { useUserStore } from '@/stores/useUserStore';
import { useWardrobeAutoSync } from '@/stores/useWardrobeStore';
import { useCreditsStore } from '@/stores/creditStore';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
      name: 'custom-outfit',
      title: 'Custom outfit',
      icon: (color: string, isLoading?: boolean) => {
        return (
          <CustomOutfitTabIcon>
            {isLoading && (
              <ActivityIndicator
                size="small"
                color={color}
                style={{ position: 'absolute' }}
              />
            )}
            <MaterialIcons size={28} name="style" color={color} />
          </CustomOutfitTabIcon>
        );
      },
    },
    {
      name: 'garment',
      title: 'Garment',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="local-mall" color={color} />;
      },
      hidden: true,
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
      name: 'wardrobe/index',
      title: 'Wardrobe',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="grid-view" color={color} />;
      },
      withLogin: true,
    },
    {
      name: 'wardrobe/[id]',
      title: 'wardrobe_id',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="account-circle" color={color} />;
      },
      hidden: true,
    },
    {
      name: 'task/index',
      title: 'Task List',
      icon: (color: string) => {
        return <MaterialIcons size={28} name="schedule" color={color} />;
      },
    },
    {
      name: 'task/[id]',
      title: 'task_id',
      hidden: true,
    },
    {
      name: 'profile',
      title: signedIn ? 'User' : 'Login in',
      icon: (color: string) => {
        return <ProfileTabIcon color={color} />;
      },
    },
    {
      name: 'login',
      title: 'User',
      hidden: true,
    },
  ];
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const { user } = useUserStore();
  const loadCredits = useCreditsStore((s) => s.load);
  const { checkCustomOutfitAccess, isCheckingAccess } = useCustomOutfitGuard();

  useWardrobeAutoSync();

  React.useEffect(() => {
    loadCredits();
  }, [loadCredits, user?._id]);

  const openLoginScreen = React.useCallback((redirectTo: string) => {
    router.push({
      pathname: '/login',
      params: { redirectTo },
    });
  }, []);

  const handleProfileTabPress = React.useCallback(
    (event: { preventDefault: () => void }) => {
      if (user) return false;

      event.preventDefault();
      openLoginScreen(pathname);

      return true;
    },
    [openLoginScreen, pathname, user],
  );

  const handleCustomOutfitTabPress = React.useCallback(
    async (event: { preventDefault: () => void }) => {
      event.preventDefault();

      const hasAccess = await checkCustomOutfitAccess();

      if (hasAccess) {
        router.push('/custom-outfit');
      }
    },
    [checkCustomOutfitAccess],
  );

  const handleTabPress = React.useCallback(
    async (name: string, event: { preventDefault: () => void }) => {
      if (name === 'profile') {
        const handled = handleProfileTabPress(event);

        if (handled) return;
      }

      if (name === 'custom-outfit') {
        await handleCustomOutfitTabPress(event);
      }
    },
    [handleCustomOutfitTabPress, handleProfileTabPress],
  );

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
          let href: null | undefined = null;

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
                tabBarIcon: ({ color }) =>
                  icon
                    ? icon(color, name === 'custom-outfit' && isCheckingAccess)
                    : null,
              }}
              listeners={{
                tabPress: (event) => handleTabPress(name, event),
              }}
            />
          );
        },
      )}
    </Tabs>
  );
}

const ProfileTabIcon = ({ color }: { color: string }) => {
  const credits = useCreditsStore((s) => s.credits || s.guestFreeLeft || 0);
  const label = `Credits: ${credits}`;

  return (
    <View style={s.profileIconWrap}>
      <MaterialIcons size={28} name="person" color={color} />

      <View style={s.creditsBadge}>
        <Text style={s.creditsText}>{label}</Text>
      </View>
    </View>
  );
};

const CustomOutfitTabIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={s.customOutfitIconWrap}>
      <View style={s.premiumBadge}>
        <Text style={s.premiumText}>Premium</Text>
      </View>

      {children}
    </View>
  );
};

const s = StyleSheet.create({
  customOutfitIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 58,
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  premiumText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
  profileIconWrap: {
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditsBadge: {
    position: 'absolute',
    top: -10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 100,
    backgroundColor: '#111827',
  },
  creditsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },
});
