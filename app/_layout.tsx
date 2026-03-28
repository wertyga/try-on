import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StripeProvider } from '../stores/billings/stripe';
import React, { useEffect } from 'react';
import { UpdateBanner } from '@/updates';
import { Toast } from '@/components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-reanimated';
import '@/i18n';

import { Button } from '@/components/ui/button';
import { StatusBox } from '@/components/ui/StatusBox';
import { useAppStore } from '@/stores/appStore';
import { ModalsList } from '@/components/ModalsList';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { getDeviceId, appDeviceId } = useAppStore();

  useEffect(() => {
    const hasDeviceId = appDeviceId !== null;

    if (loaded && hasDeviceId) {
      SplashScreen.hideAsync();
    }
  }, [loaded, appDeviceId]);

  useEffect(() => {
    getDeviceId();
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
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>

            <StatusBar style="auto" />
            <UpdateBanner />
            <ModalsList />
            <Toast />
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
            <StatusBox message={String(error?.message)} variant="error" />
          </View>

          <Button onPress={retry} dark>
            Repeat
          </Button>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
