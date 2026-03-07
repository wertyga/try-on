import { create } from 'zustand';

import { useUserStore } from '@/stores/useUserStore';
import { Analytics } from '@/analytics';
import { router } from 'expo-router';
import { sendLogs } from '@/api';
import Toast from 'react-native-toast-message';
import { storage } from '@/utils';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { useWardrobeStore } from '@/stores/useWardrobeStore';
import { TUser } from '@/types';
import { useOAuthStore } from '@/stores/auth/useOauthStore';
import { useUsageStore } from '@/stores/useUsageStore';
import {
  TAuthEmailStore,
  useAuthEmailStore,
} from '@/stores/auth/useAuthEmailStore';
import { useCreditsStore } from '@/stores/creditStore';

type TAuthStore = {
  isLoading: boolean;
  signInWithApple: (callback?: () => void) => Promise<void>;
  signInWithGoogle: (callback?: () => void) => Promise<void>;
  logout: () => void;
  updateUser: (user: TUser) => Promise<void>;
  signInByEmail: (
    ...params: Parameters<TAuthEmailStore['signIn']>
  ) => Promise<boolean>;
};

export const useAuthStore = create<TAuthStore>((set, get) => ({
  isLoading: false,

  updateUser: async (user: TUser) => {
    await storage.set('token', user.token);

    await useUserStore.getState().getUserSelf();
  },

  signInWithApple: async (callback?: () => void) => {
    try {
      set({ isLoading: true });

      Analytics.event('login_apple_start');

      const user = await useOAuthStore.getState().signInWithApple();

      await get().updateUser(user);

      await Analytics.event('login_apple_success');
      await Analytics.userId(user.email);
      await Analytics.userProp('auth', 'user');

      router.replace('/try-on');

      callback?.();
    } catch (e: any) {
      Analytics.event('login_apple_error', {
        code: e.code || 'unknown',
        message: e.message,
      });

      if (e.code !== 'ERR_REQUEST_CANCELED') {
        sendLogs(e.message);

        Toast.show({
          type: 'error',
          text1: e.message,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async (callback?: () => void) => {
    try {
      set({ isLoading: true });

      Analytics.event('login_google_start');

      const user = await useOAuthStore.getState().signInWithGoogle();

      await get().updateUser(user);

      await Analytics.event('login_google_success');
      await Analytics.userId(user.email);
      await Analytics.userProp('auth', 'user');

      router.replace('/try-on');

      callback?.();
    } catch (e: any) {
      Analytics.event('login_google_error', {
        code: e.code || 'unknown',
        message: e.message,
      });

      sendLogs(e.message);

      Toast.show({
        type: 'error',
        text1: e.message,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  signInByEmail: async (...params: Parameters<TAuthEmailStore['signIn']>) => {
    try {
      const user = await useAuthEmailStore.getState().signIn(...params);

      await get().updateUser(user);

      return true;
    } catch (e: any) {
      Analytics.event('login_google_error', {
        code: e.status || 'unknown',
        message: e.message,
      });

      sendLogs(e.message);

      Toast.show({
        type: 'error',
        text1: e.message,
      });

      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    Analytics.event('logout');

    await useOAuthStore.getState().appleLogout();
    await useOAuthStore.getState().googleLogout();

    useUserStore.getState().dropUser();
    useTryOnStore.getState().clear();
    useWardrobeStore.getState().clear();
    useUsageStore.getState().reset();

    await useCreditsStore.getState().load();
    //
    // try {
    //   const usage = await fetchDeviceId();
    //
    //   await useUsageStore.getState().update({
    //     deviceId: usage.deviceId,
    //     count: usage.generationsLeft,
    //   });
    // } catch (e: any) {
    //   sendLogs(e?.message || 'Failed to refresh usage after logout');
    // }
  },
}));
