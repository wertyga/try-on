import { create } from 'zustand';

type TModalsState = {
  isPaywallOpen: boolean;
  isLoginOpen: boolean;
};

type TModalsActions = {
  openPaywall: () => void;
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
  isLoginOpen: false,
};

export const useModalsStore = create<TModalsStore>((set) => ({
  ...initialState,

  openPaywall: () => set({ isPaywallOpen: true }),
  closePaywall: () => set({ isPaywallOpen: false }),
  setPaywallOpen: (isPaywallOpen) => set({ isPaywallOpen }),

  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
  setLoginOpen: (isLoginOpen) => set({ isLoginOpen }),

  closeAllModals: () => set(initialState),
}));
