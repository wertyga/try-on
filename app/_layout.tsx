import { View, Text, Pressable } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StripeProvider } from '@/stripe';
import { installGlobalErrorHandlers } from '@/utils/errors';
import React, { useEffect } from 'react';
import { UpdateBanner } from '@/updates';
import { Analytics } from '@/analytics';
import { Toast } from '@/components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-reanimated';
import '@/i18n';

import { Button } from '@/components/ui/button';
import { ErrorBox } from '@/components/ui/ErrorBox';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    Analytics.screen(pathname);
  }, [pathname]);

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <StripeProvider>
          <GestureHandlerRootView>
            <Stack initialRouteName="index">
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="welcome" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>

            <StatusBar style="auto" />
            <Toast />
            <UpdateBanner />
          </GestureHandlerRootView>
        </StripeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
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
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <View style={{ padding: 16 }}>
          <View style={{ marginBottom: 16 }}>
            <ErrorBox error={String(error?.message)} />
          </View>

          <Button onPress={retry} dark>
            Repeat
          </Button>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
