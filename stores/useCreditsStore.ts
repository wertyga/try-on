import { create } from 'zustand';
import { TCreditPack, TSettings } from '@/types';
import { fetchBillingState } from '@/api';

import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { createPaymentSheet } from '@/api/billing.api';

type CreditsState = {
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
  isBuying: boolean;
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

export type UseCreditsStore = CreditsState & CreditsActions;

const initialState: CreditsState = {
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
  isBuying: false,
  error: null,

  isBuyingPackId: null,
};

const useCreditsStore = create<UseCreditsStore>((set, get) => ({
  ...initialState,

  buyPack: async (priceId: string) => {
    set({ isBuyingPackId: priceId, error: null });
    try {
      const ps = await createPaymentSheet(priceId);

      const init = await initPaymentSheet({
        merchantDisplayName: 'TryOn',
        customerId: ps.customerId,
        customerEphemeralKeySecret: ps.ephemeralKeySecret,
        paymentIntentClientSecret: ps.paymentIntentClientSecret,
        allowsDelayedPaymentMethods: false,
        // returnURL: 'tryon://paywall', // если используешь deep links
      });

      if (init.error) throw new Error(init.error.message);

      const present = await presentPaymentSheet();
      if (present.error) throw new Error(present.error.message);

      // Оплата прошла в SDK, но кредиты начислятся webhook'ом.
      // Чтобы UI обновился — просто reload:
      await get().load();
    } catch (e: any) {
      set({ error: e?.message || 'Payment failed' });
      throw e;
    } finally {
      set({ isBuyingPackId: null });
    }
  },

  clearError: () => set({ error: null }),

  load: async () => {
    set({ isLoading: true, error: null });

    try {
      const state = await fetchBillingState();

      set({
        settings: state.settings ?? null,
        packs: (state.packs ?? []).filter((p) => p.isActive !== false),

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

export default useCreditsStore;
