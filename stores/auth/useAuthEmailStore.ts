import { create } from 'zustand';
import Toast from 'react-native-toast-message';

import {
  signInRequest,
  signUpRequest,
  changeEmail as changeEmailApi,
  recoveryPasswordInit as recoveryPasswordInitApi,
  recoveryPassword as recoveryPasswordApi,
} from './auth.api';
import { TUser } from '@/types';
import { trackSignupBonusGranted, trackSignupCompleted } from '@/analytics';

export type TAuthEmailStore = {
  isLoading: boolean;
  signIn: (...data: Parameters<typeof signInRequest>) => Promise<TUser>;
  signUp: (...data: Parameters<typeof signUpRequest>) => Promise<boolean>;
  recoveryPasswordInit: (
    ...data: Parameters<typeof recoveryPasswordInitApi>
  ) => Promise<{ success: boolean }>;
  recoveryPassword: (
    ...data: Parameters<typeof recoveryPasswordApi>
  ) => Promise<{ success: boolean }>;
  changeEmail: (
    ...data: Parameters<typeof changeEmailApi>
  ) => Promise<{ success: boolean }>;
};

export const useAuthEmailStore = create<TAuthEmailStore>((set, get) => ({
  isLoading: false,

  signIn: async (...data: Parameters<typeof signInRequest>) => {
    const { user } = await signInRequest(...data);

    return user;
  },

  signUp: async (
    ...data: Parameters<typeof signUpRequest>
  ): Promise<boolean> => {
    try {
      set({ isLoading: true });

      const isSuccess = await signUpRequest(...data);

      if (isSuccess) {
        trackSignupCompleted();
        trackSignupBonusGranted();

        Toast.show({
          type: 'success',
          text1: 'Check your e-mail for confirmation',
        });
      }

      return isSuccess;
    } catch (e) {
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  async changeEmail(...data: Parameters<typeof changeEmailApi>) {
    try {
      set({ isLoading: true });

      const response = await changeEmailApi(...data);

      return response;
    } catch (e) {
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  recoveryPasswordInit: async (
    ...data: Parameters<typeof recoveryPasswordInitApi>
  ) => {
    try {
      set({ isLoading: true });

      const response = await recoveryPasswordInitApi(...data);

      Toast.show({
        type: 'success',
        text1: 'Check your e-mail for confirmation',
      });

      return response;
    } catch (e) {
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  recoveryPassword: async (...data: Parameters<typeof recoveryPasswordApi>) => {
    try {
      set({ isLoading: true });

      const response = await recoveryPasswordApi(...data);

      return response;
    } catch (e) {
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },
}));
