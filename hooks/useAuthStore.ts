import { create } from 'zustand';

import { oauthGoogleRegister } from '@/api/auth.api';
import { useUserStore } from '@/hooks/useUserStore';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { TUser } from '@/types';
import { Analytics } from '@/analytics';

type TAuthStore = {
  isLoading: boolean;
  registerWithGoogle: (
    ...data: Parameters<typeof oauthGoogleRegister>
  ) => Promise<TUser>;
  googleLogout: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<TAuthStore>((set, get) => ({
  isLoading: false,

  registerWithGoogle: async (
    ...data: Parameters<typeof oauthGoogleRegister>
  ) => {
    set({ isLoading: true });

    try {
      const { user } = await oauthGoogleRegister(...data);

      useUserStore.getState().setUser(user);
      useUserStore.getState().updateUserCategories();

      await Analytics.event('login_google_success');
      await Analytics.userId(user._id);
      await Analytics.userProp('auth', 'user');

      set({ isLoading: false });

      return user;
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    Analytics.event('logout');

    useUserStore.getState().dropUser();
    get().googleLogout();
  },

  googleLogout: async () => {
    const googleUser = GoogleSignin.getCurrentUser();

    if (googleUser) {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    }
  },
}));
