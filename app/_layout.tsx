import { View, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StripeProvider } from '../stores/billings/stripe';
import React, { useEffect, useLayoutEffect } from 'react';
import { UpdateBanner } from '@/updates';
import { Toast } from '@/components/Toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen as SplashScreenComponent } from '@/components/SplashScreen';

import 'react-native-reanimated';
import '@/i18n';

import { Button } from '@/components/ui/button';
import { StatusBox } from '@/components/ui/StatusBox';
import { useAppStore } from '@/stores/appStore';
import { ModalsList } from '@/components/ModalsList';
import { sendLogs } from '@/api';
import { Analytics, isAnalyticEnabled } from '@/analytics';
import { useUserStore } from '@/stores/useUserStore';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useWatchUpdate } from '@/updates/useWatchUpdate';
import { useCreditsStore } from '@/stores';

SplashScreen.preventAutoHideAsync();

if (isAnalyticEnabled()) {
  Analytics.init();
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { getDeviceId, appDeviceId } = useAppStore();
  const getUserSelf = useUserStore((s) => s.getUserSelf);
  const initializeCreditStore = useCreditsStore((s) => s.initialize);

  const { hasChecked, updateMode, onDismiss } = useWatchUpdate();

  useEffect(() => {
    if (appDeviceId && hasChecked) {
      SplashScreen.hideAsync();
    }
  }, [appDeviceId, hasChecked]);

  useEffect(() => {
    if (!loaded) return;

    initializeCreditStore();
    getDeviceId().then(() => {
      return getUserSelf();
    });
  }, [loaded]);

  useEffect(() => {
    if (!appDeviceId) return;

    Analytics.identify(appDeviceId);
  }, [appDeviceId]);

  if (!loaded || appDeviceId === null || !hasChecked) {
    return <LoadingScreen />;
  }

  if (updateMode === 'critical') {
    return (
      <>
        <SplashScreenComponent />
        <GestureHandlerRootView>
          <UpdateBanner mode={updateMode} onDismiss={onDismiss} />
        </GestureHandlerRootView>
      </>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <StripeProvider>
          <GestureHandlerRootView>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
            </Stack>

            <StatusBar style="auto" />
            <UpdateBanner mode={updateMode} onDismiss={onDismiss} />
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
  useEffect(() => {
    sendLogs(error);
  }, [error]);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <View style={{ padding: 16 }}>
          <ScrollView style={{ marginBottom: 16 }}>
            <StatusBox message={String(error?.message)} variant="error" />
          </ScrollView>

          <Button onPress={retry} dark>
            Repeat
          </Button>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
