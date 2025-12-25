import { create } from 'zustand';

type ForceUpdateState = {
  required: boolean;
  minBuild?: number;
  message?: string;
  setRequired: (payload?: { minBuild?: number; message?: string }) => void;
  clear: () => void;
};

export const useForceUpdateStore = create<ForceUpdateState>((set) => ({
  required: false,
  minBuild: undefined,
  message: undefined,
  setRequired: (payload) =>
    set({
      required: true,
      minBuild: payload?.minBuild,
      message: payload?.message,
    }),
  clear: () =>
    set({ required: false, minBuild: undefined, message: undefined }),
}));
