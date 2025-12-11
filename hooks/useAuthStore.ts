import { create } from 'zustand';

import { oauthGoogleRegister } from '@/api/auth.api';
import { useUserStore } from '@/hooks/useUserStore';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { TUser } from '@/types';
import { Analytics } from '@/analytics';
import { router } from 'expo-router';
import { sendLogs } from '@/api';
import Toast from 'react-native-toast-message';
import { storage } from '@/utils';
import { useTryOnStore } from '@/hooks/useTryOnStore';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';

type TAuthStore = {
  isLoading: boolean;
  registerWithGoogle: (
    ...data: Parameters<typeof oauthGoogleRegister>
  ) => Promise<TUser>;
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

      GoogleSignin.configure();
      await GoogleSignin.hasPlayServices();
      const { user: gUser } = await GoogleSignin.signIn();

      await get().registerWithGoogle({
        email: gUser.email,
        username: gUser.name ?? '',
      });

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

  registerWithGoogle: async (
    ...data: Parameters<typeof oauthGoogleRegister>
  ) => {
    try {
      const { user } = await oauthGoogleRegister(...data);

      await storage.set('token', user.token);

      await useUserStore.getState().getUserSelf();

      await Analytics.event('login_google_success');
      await Analytics.userId(user._id);
      await Analytics.userProp('auth', 'user');

      set({ isLoading: false });

      return user;
    } catch (e) {
      throw e;
    }
  },

  logout: () => {
    Analytics.event('logout');

    useUserStore.getState().dropUser();
    get().googleLogout();

    useTryOnStore.getState().clear();
    useWardrobeStore.getState().clear();
  },

  googleLogout: async () => {
    const googleUser = GoogleSignin.getCurrentUser();

    if (googleUser) {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    }
  },
}));
