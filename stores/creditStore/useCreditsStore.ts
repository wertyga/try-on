import { create } from 'zustand';
import { Platform } from 'react-native';

import { TSettings } from '@/types';

import { fetchBillingState } from './credit.api';
import { buildAPIError } from '@/api/base';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useStripeStore } from '@/stores/billings/stripe';
import { useIapStore } from '@/stores/billings/iap';
import { TCreditPack } from './credit.types';

type TCreditsState = {
  settings: TSettings | null;

  packs: TCreditPack[];

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

type TCreditsActions = {
  load: () => Promise<void>;
  canGenerate: () => boolean;
  getBalanceLabel: () => string;
  onGenerationSuccess: () => Promise<void>;
  clearError: () => void;
  buyPack: (packId: string) => Promise<void>;
  fetchPacks: () => Promise<void>;

  _loadStripePacks: () => Promise<TCreditPack[]>;
  _loadIapPacks: () => Promise<TCreditPack[]>;
};

export type TCreditsStore = TCreditsState & TCreditsActions;

const initialState: TCreditsState = {
  settings: null,
  packs: [],

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

const isIOS = Platform.OS === 'ios';

export const useCreditsStore = create<TCreditsStore>((set, get) => ({
  ...initialState,

  buyPack: async (priceId: string) => {
    set({ isBuyingPackId: priceId, error: null });

    try {
      const buyMethod = isIOS
        ? useIapStore.getState().buyPack
        : useStripeStore.getState().buyStripeProduct;

      await buyMethod(priceId);

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

  _loadStripePacks: async (): Promise<TCreditPack[]> => {
    await useStripeStore.getState().fetchStripeKey();

    const stripePacks = await useStripeStore.getState().fetchProductsPacks();

    return stripePacks;
  },

  _loadIapPacks: async (): Promise<TCreditPack[]> => {
    const iapPacks = await useIapStore.getState().fetchPacks();

    return iapPacks.map(
      ({ title, description = '', productIdentifier, priceString }) => {
        return {
          id: productIdentifier,
          priceId: productIdentifier,
          title: `${title} - ${priceString}`,
          description,
          credits: 0,
          priceLabel: '',
          marketFeatures: [],
          isActive: true,
        };
      },
    );
  },

  fetchPacks: async () => {
    try {
      set({ isLoading: true, error: null });

      const fetchProductsPacks = isIOS
        ? get()._loadIapPacks
        : get()._loadStripePacks;

      const packs = await fetchProductsPacks();

      set({ packs });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load packs' });
    } finally {
      set({ isLoading: false });
    }
  },

  load: async () => {
    set({ isLoading: true, error: null });

    try {
      const state = await fetchBillingState();

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
