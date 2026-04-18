import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

export type TAppStoreState = {
  appDeviceId: string | null;
};

export type TAppStoreActions = {
  updateDeviceId: (appDeviceId: string | null) => void;
  getDeviceId: () => Promise<void>;
};

export type TAppStore = TAppStoreState & TAppStoreActions & {};

export const isIOS = Platform.OS === 'ios';

export const useAppStore = create<TAppStore>((set, get) => {
  return {
    appDeviceId: null,

    updateDeviceId: (appDeviceId) => {
      set({ appDeviceId });
    },

    getDeviceId: async () => {
      let appDeviceId = '';

      if (Platform.OS === 'android') {
        appDeviceId = Application.getAndroidId();
      } else if (isIOS) {
        appDeviceId = (await Application.getIosIdForVendorAsync()) as string;
      }

      get().updateDeviceId(appDeviceId ?? '');
    },
  };
});
