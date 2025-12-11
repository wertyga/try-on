import { View, Text, Pressable } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import '@/i18n';
import { useEffect } from 'react';
import UpdateBanner from '@/components/UpdateBanner';
import { Analytics } from '@/analytics';
import { Toast } from '@/components/Toast';
import { useUserStore } from '@/hooks/useUserStore';
import { deviceId } from '@/utils/hash';
import { storage } from '@/utils';
import { useUsageStore } from '@/hooks';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const usage = useUsageStore();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    Analytics.screen(pathname);
  }, [pathname]);

  if (!loaded) return null;

  return (
    <>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      {/*<View style={{ position: 'absolute', bottom: 50, width: 200 }}>*/}
      {/*  <Text>generationsLeft - {usage.count}</Text>*/}
      {/*  <Text>deviceId - {usage.deviceId ?? ''}</Text>*/}
      {/*  <Pressable*/}
      {/*    style={{ padding: 10, backgroundColor: 'white' }}*/}
      {/*    onPress={() => {*/}
      {/*      storage.set('device_id', 'sdasd');*/}
      {/*    }}*/}
      {/*  >*/}
      {/*    <Text>Clear device id</Text>*/}
      {/*  </Pressable>*/}
      {/*</View>*/}
      <Toast />
      <UpdateBanner />
    </>
  );
}

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: '800', marginBottom: 8 }}>Error</Text>
      <Text style={{ color: '#991B1B', marginBottom: 12 }}>
        {String(error?.message)}
      </Text>
      <Pressable onPress={retry}>
        <Text>Repeat</Text>
      </Pressable>
    </View>
  );
}
