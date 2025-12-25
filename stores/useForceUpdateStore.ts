import { create } from 'zustand';

type ForceUpdateState = {
  required: boolean;
  minBuild?: number;
  message?: string;

  setRequired: (payload?: { minBuild?: number; message?: string }) => void;
  clear: () => void;
  handleUpdateRequireError: (e: any) => boolean;
};

export const useForceUpdateStore = create<ForceUpdateState>((set) => ({
  required: false,
  minBuild: undefined,
  message: undefined,
  setRequired: (payload) => {
    set({
      required: true,
      minBuild: payload?.minBuild,
      message: payload?.message,
    });
  },
  clear: () => {
    set({ required: false, minBuild: undefined, message: undefined });
  },
  handleUpdateRequireError: (e: any) => {
    const isUpdateRequireError = (e.response?.status || e.status) === 426;

    if (!isUpdateRequireError) return false;

    set({
      required: true,
      minBuild: undefined,
      message: 'Please update the app to continue.',
    });

    return true;
  },
}));
