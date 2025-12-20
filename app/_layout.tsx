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
import { useForceUpdateStore } from '@/hooks/useForceUpdateStore';
import ForceUpdateScreen from '@/components/ForceUpdateScreen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const required = useForceUpdateStore((s) => s.required);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    Analytics.screen(pathname);
  }, [pathname]);

  if (!loaded) return null;

  if (required) {
    return <ForceUpdateScreen />;
  }

  return (
    <>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
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
