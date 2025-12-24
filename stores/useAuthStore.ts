import { create } from 'zustand';

import { oauthGoogleRegister } from '@/api/auth.api';
import { useUserStore } from '@/stores/useUserStore';

import {
  GoogleSignin,
  type User as TGoogle,
} from '@react-native-google-signin/google-signin';
import { Analytics } from '@/analytics';
import { router } from 'expo-router';
import { sendLogs } from '@/api';
import Toast from 'react-native-toast-message';
import { storage } from '@/utils';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { useWardrobeStore } from '@/stores/useWardrobeStore';

type TAuthStore = {
  isLoading: boolean;
  getGoogleUser: () => Promise<TGoogle['user']>;
  googleLogout: () => Promise<void>;
  signInWithGoogle: (callback?: () => void) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<TAuthStore>((set, get) => ({
  isLoading: false,

  signInWithGoogle: async (callback?: () => void) => {
    try {
      set({ isLoading: true });

      Analytics.event('login_google_start');

      const gUser = await get().getGoogleUser();

      const { user } = await oauthGoogleRegister({
        email: gUser.email,
        username: gUser.name ?? '',
      });

      await storage.set('token', user.token);
      console.log({ gUser, user });
      await Analytics.event('login_google_success');
      await Analytics.userId(user.email);
      await Analytics.userProp('auth', 'user');

      await useUserStore.getState().getUserSelf();

      router.replace('/try-on');

      callback?.();
    } catch (e: any) {
      console.log({ e });
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

  getGoogleUser: async () => {
    GoogleSignin.configure();
    await GoogleSignin.hasPlayServices();

    const { user } = await GoogleSignin.signIn();

    return user;
  },

  logout: async () => {
    GoogleSignin.configure();

    Analytics.event('logout');

    await get().googleLogout();

    useUserStore.getState().dropUser();
    useTryOnStore.getState().clear();
    useWardrobeStore.getState().clear();
  },

  googleLogout: async () => {
    const googleUser = await GoogleSignin.getCurrentUser();

    if (googleUser) {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    }
  },
}));
