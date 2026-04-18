import { create } from 'zustand';

import { useUserStore } from '@/stores/useUserStore';
import { router } from 'expo-router';
import { requestUserDataDeletion, sendLogs } from '@/api';
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
  requestUserDataDeletion: (password: string) => Promise<void>;
  updateUser: (user: TUser) => Promise<void>;
  signInByEmail: (
    ...params: Parameters<TAuthEmailStore['signIn']>
  ) => Promise<boolean>;
  taskIds: () => string[];
};

export const useAuthStore = create<TAuthStore>((set, get) => ({
  isLoading: false,

  taskIds: () => {
    return useTryOnStore.getState().tasks.map(({ id }) => id);
  },

  updateUser: async (user: TUser) => {
    await storage.set('token', user.token);

    await useUserStore.getState().getUserSelf();
  },

  signInWithApple: async (callback?: () => void) => {
    try {
      set({ isLoading: true });

      const user = await useOAuthStore
        .getState()
        .signInWithApple({ taskIds: get().taskIds() });

      await get().updateUser(user);

      if (callback) {
        callback();
      } else {
        router.replace('/try-on');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async (callback?: () => void) => {
    try {
      set({ isLoading: true });

      const user = await useOAuthStore
        .getState()
        .signInWithGoogle({ taskIds: get().taskIds() });

      await get().updateUser(user);

      if (callback) {
        callback();
      } else {
        router.replace('/try-on');
      }
    } catch (e: any) {
      sendLogs(e.message);
    } finally {
      set({ isLoading: false });
    }
  },

  signInByEmail: async (...params: Parameters<TAuthEmailStore['signIn']>) => {
    try {
      set({ isLoading: true });

      const user = await useAuthEmailStore.getState().signIn(...params);

      await get().updateUser(user);

      return true;
    } catch (e: any) {
      sendLogs(e.message);

      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await useOAuthStore.getState().clear();
    await useUserStore.getState().dropUser();

    useTryOnStore.getState().clear();
    useWardrobeStore.getState().clear();
    useUsageStore.getState().reset();

    await useCreditsStore.getState().load();
  },

  requestUserDataDeletion: async (password: string) => {
    await requestUserDataDeletion(password);
    await get().logout();
  },
}));
