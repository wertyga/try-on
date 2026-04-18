import { create } from 'zustand';
import { trackPaywallOpened } from '@/analytics';

type TModalsState = {
  isPaywallOpen: boolean;
  paywallTitleKey?: string;
  paywallSubtitleKey?: string;
  isLoginOpen: boolean;
};

type TModalsActions = {
  openPaywall: (params?: {
    titleKey?: string;
    subtitleKey?: string;
  }) => void;
  closePaywall: () => void;
  setPaywallOpen: (isOpen: boolean) => void;
  openLogin: () => void;
  closeLogin: () => void;
  setLoginOpen: (isOpen: boolean) => void;
  closeAllModals: () => void;
};

export type TModalsStore = TModalsState & TModalsActions;

const initialState: TModalsState = {
  isPaywallOpen: false,
  paywallTitleKey: undefined,
  paywallSubtitleKey: undefined,
  isLoginOpen: false,
};

export const useModalsStore = create<TModalsStore>((set) => ({
  ...initialState,

  openPaywall: (params) =>
    {
      trackPaywallOpened(params?.titleKey ?? 'modal');

      set({
        isPaywallOpen: true,
        paywallTitleKey: params?.titleKey,
        paywallSubtitleKey: params?.subtitleKey,
      });
    },
  closePaywall: () =>
    set({
      isPaywallOpen: false,
      paywallTitleKey: undefined,
      paywallSubtitleKey: undefined,
    }),
  setPaywallOpen: (isPaywallOpen) => set({ isPaywallOpen }),

  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
  setLoginOpen: (isLoginOpen) => set({ isLoginOpen }),

  closeAllModals: () => set(initialState),
}));
