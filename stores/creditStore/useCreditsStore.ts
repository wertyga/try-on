import { create } from 'zustand';
import { Platform } from 'react-native';

import { TSettings } from '@/types';

import { fetchBillingState } from './credit.api';
import { buildAPIError } from '@/api/base';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useStripeStore } from '@/stores/billings/stripe';
import { useIapStore } from '@/stores/billings/iap';
import { TCreditPack } from './credit.types';
import { useModalsStore } from '@/stores/useModalsStore';
import { useUserStore } from '@/stores/useUserStore';

export enum PaymentCode {
  Canceled = 'Canceled',
  Failed = 'Failed',
}

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
  reservedTaskIds: string[];
  pendingReservationIds: string[];

  isLoading: boolean;
  error: {
    message: string;
    code: PaymentCode;
  } | null;

  isBuyingPack: boolean;
};

type TCreditsActions = {
  load: () => Promise<void>;
  canGenerate: (showFallbackModal?: boolean) => boolean;
  getBalanceLabel: () => string;
  onGenerationSuccess: () => Promise<void>;
  onGenerationSettled: () => Promise<void>;
  beginGenerationReservation: () => string | null;
  onGenerationStarted: (
    reservationId: string | null,
    taskId: string,
  ) => Promise<void>;
  releaseGenerationReservation: (reservationId: string | null) => void;
  syncTaskReservations: (taskIds: string[]) => void;
  getAvailablePaidCredits: () => number;
  clearError: () => void;
  buyPack: (packId: string) => Promise<void>;
  fetchPacks: () => Promise<void>;
  initialize: () => Promise<void>;

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
  reservedTaskIds: [],
  pendingReservationIds: [],

  isLoading: false,
  error: null,

  isBuyingPack: false,
};

const isIOS = Platform.OS === 'ios';

export const useCreditsStore = create<TCreditsStore>((set, get) => ({
  ...initialState,

  initialize: async () => {
    if (isIOS) {
      await useIapStore.getState().initialize();
    }
  },

  buyPack: async (priceId: string) => {
    set({ isBuyingPack: true, error: null });

    try {
      const buyMethod = isIOS
        ? useIapStore.getState().buyPack
        : useStripeStore.getState().buyStripeProduct;

      await buyMethod(priceId);

      await get().load();

      useModalsStore.getState().closePaywall();
    } catch (e: any) {
      const { message = 'Payment failed', status, code } = buildAPIError(e);
      console.log({ e });
      if (status === 403) {
        await useAuthStore.getState().logout();
      } else {
        set({
          error: {
            message,
            code,
          },
        });
      }
    } finally {
      set({ isBuyingPack: false });
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
      const { message = 'Failed to load packs', code = PaymentCode.Failed } =
        buildAPIError(e);

      set({
        error: {
          message,
          code,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  load: async () => {
    if (get().isLoading) {
      return;
    }

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
      const {
        message = 'Failed to load billing state',
        code = PaymentCode.Failed,
      } = buildAPIError(e);

      set({
        error: {
          message,
          code,
        },
      });
    } finally {
      set({ isLoading: false });
    }
  },

  canGenerate: (showFallbackModal = false) => {
    const s = get();

    if ((s.freeDailyLeft ?? 0) > 0) return true;
    if (get().getAvailablePaidCredits() > 0) return true;
    if ((s.guestFreeLeft ?? 0) > 0) return true;

    if (showFallbackModal) {
      const modals = useModalsStore.getState();
      const user = useUserStore.getState().user;

      modals.closeAllModals();

      if (user) {
        modals.openPaywall();
      } else {
        modals.openLogin();
      }
    }

    return false;
  },

  getBalanceLabel: () => {
    const s = get();
    const parts: string[] = [];
    parts.push(`Free today: ${s.freeDailyLeft ?? 0}`);
    parts.push(`Credits: ${get().getAvailablePaidCredits()}`);
    if ((s.guestFreeLeft ?? 0) > 0)
      parts.push(`Guest free: ${s.guestFreeLeft}`);
    return parts.join(' • ');
  },

  getAvailablePaidCredits: () => {
    const s = get();

    return Math.max(
      (s.credits ?? 0) -
        s.reservedTaskIds.length -
        s.pendingReservationIds.length,
      0,
    );
  },

  beginGenerationReservation: () => {
    const s = get();
    const user = useUserStore.getState().user;

    const shouldReservePaidCredit =
      !!user &&
      (s.freeDailyLeft ?? 0) <= 0 &&
      (s.guestFreeLeft ?? 0) <= 0 &&
      get().getAvailablePaidCredits() > 0;

    if (!shouldReservePaidCredit) {
      return null;
    }

    const reservationId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({
      pendingReservationIds: [...state.pendingReservationIds, reservationId],
    }));

    return reservationId;
  },

  onGenerationStarted: async (reservationId, taskId) => {
    if (!reservationId) {
      await get().load();
      return;
    }

    set((state) => ({
      pendingReservationIds: state.pendingReservationIds.filter(
        (id) => id !== reservationId,
      ),
      reservedTaskIds: state.reservedTaskIds.includes(taskId)
        ? state.reservedTaskIds
        : [...state.reservedTaskIds, taskId],
    }));
  },

  releaseGenerationReservation: (reservationId) => {
    if (!reservationId) return;

    set((state) => ({
      pendingReservationIds: state.pendingReservationIds.filter(
        (id) => id !== reservationId,
      ),
      reservedTaskIds: state.reservedTaskIds.filter(
        (id) => id !== reservationId,
      ),
    }));
  },

  syncTaskReservations: (taskIds) => {
    set({ reservedTaskIds: taskIds });
  },

  onGenerationSuccess: async () => {
    await get().load();
  },

  onGenerationSettled: async () => {
    await get().load();
  },
}));
