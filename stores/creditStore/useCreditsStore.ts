import { create } from 'zustand';

import { TSettings } from '@/types';

import { fetchBillingState } from './credit.api';
import { buildAPIError } from '@/api/base';
import { useAuthStore } from '@/stores/useAuthStore';
import { StripeSlice, TStripeSlice } from '@/stripe';

type CreditsState = {
  settings: TSettings | null;

  // guest
  guestFreeUsed: number;
  guestFreeLeft: number;

  // user
  freeDailyUsed: number;
  freeDailyLeft: number;
  credits: number;

  resetsAt: string | null;
  autoRefillEnabled: boolean;

  isLoading: boolean;
  error: string | null;

  isBuyingPackId: string | null;
};

type CreditsActions = {
  load: () => Promise<void>;
  canGenerate: () => boolean;
  getBalanceLabel: () => string;
  onGenerationSuccess: () => Promise<void>;
  clearError: () => void;
  buyPack: (packId: string) => Promise<void>;
};

export type UseCreditsStore = CreditsState & CreditsActions & TStripeSlice;

const initialState: CreditsState = {
  settings: null,

  guestFreeUsed: 0,
  guestFreeLeft: 0,

  freeDailyUsed: 0,
  freeDailyLeft: 0,
  credits: 0,

  resetsAt: null,
  autoRefillEnabled: false,

  isLoading: false,
  error: null,

  isBuyingPackId: null,
};

export const useCreditsStore = create<UseCreditsStore>((set, get) => ({
  ...initialState,

  ...StripeSlice(set, get),

  buyPack: async (priceId: string) => {
    set({ isBuyingPackId: priceId, error: null });

    try {
      await get().buyStripeProduct(priceId);

      await get().load();
    } catch (e: any) {
      const { message = 'Payment failed', status } = buildAPIError(e);

      if (status === 403) {
        await useAuthStore.getState().logout();
      } else {
        set({
          error: message,
        });
        throw e;
      }
    } finally {
      set({ isBuyingPackId: null });
    }
  },

  clearError: () => set({ error: null }),

  load: async () => {
    set({ isLoading: true, error: null });

    try {
      get().fetchStripeKey();

      const [state] = await Promise.all([
        fetchBillingState(),
        get().fetchProductsPacks(),
      ]);

      set({
        settings: state.settings ?? null,

        guestFreeUsed: state.guestFreeUsed ?? 0,
        guestFreeLeft: state.guestFreeLeft ?? 0,

        freeDailyUsed: state.freeDailyUsed ?? 0,
        freeDailyLeft: state.freeDailyLeft ?? 0,

        credits: state.credits ?? 0,

        resetsAt: state.resetsAt ?? null,
        autoRefillEnabled: state.autoRefillEnabled ?? false,
      });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load billing state' });
    } finally {
      set({ isLoading: false });
    }
  },

  canGenerate: () => {
    const s = get();

    if ((s.freeDailyLeft ?? 0) > 0) return true;
    if ((s.credits ?? 0) > 0) return true;
    if ((s.guestFreeLeft ?? 0) > 0) return true;
    return false;
  },

  getBalanceLabel: () => {
    const s = get();
    const parts: string[] = [];
    parts.push(`Free today: ${s.freeDailyLeft ?? 0}`);
    parts.push(`Credits: ${s.credits ?? 0}`);
    if ((s.guestFreeLeft ?? 0) > 0)
      parts.push(`Guest free: ${s.guestFreeLeft}`);
    return parts.join(' • ');
  },

  onGenerationSuccess: async () => {
    await get().load();
  },
}));
