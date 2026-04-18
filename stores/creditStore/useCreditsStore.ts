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
import { isIOS } from '@/stores/appStore';

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
  guestCredits: number;
  paidCredits: number;
  totalAvailable: number;

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
  getAvailableCredits: () => number;
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
  guestCredits: 0,

  paidCredits: 0,
  totalAvailable: 0,

  reservedTaskIds: [],
  pendingReservationIds: [],

  isLoading: false,
  error: null,

  isBuyingPack: false,
};

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

      const user = useUserStore.getState().user;

      if (status === 403 && user) {
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
        guestFreeUsed: state.guestFreeUsed ?? 0,
        guestFreeLeft: state.guestFreeLeft ?? 0,
        guestCredits: state.guestCredits ?? 0,
        paidCredits: state.paidCredits ?? 0,
        totalAvailable: (state.guestFreeLeft ?? 0) + (state.paidCredits ?? 0),
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

    if (get().getAvailableCredits() > 0) return true;
    if ((s.guestFreeLeft ?? 0) > 0) return true;

    if (showFallbackModal) {
      const modals = useModalsStore.getState();
      const user = useUserStore.getState().user;

      modals.closeAllModals();

      if (!user && !isIOS) {
        modals.openLogin();
      } else {
        modals.openPaywall();
      }
    }

    return false;
  },

  getBalanceLabel: () => {
    const s = get();
    const parts: string[] = [];

    parts.push(`Credits: ${s.getAvailableCredits()}`);

    if ((s.guestFreeLeft ?? 0) > 0) {
      parts.push(`Free credits: ${s.guestFreeLeft}`);
    }

    return parts.join(' • ');
  },

  getAvailableCredits: () => {
    const s = get();

    return Math.max(
      (s.totalAvailable ?? 0) -
        s.reservedTaskIds.length -
        s.pendingReservationIds.length,
      0,
    );
  },

  getDisplayCredits: () => {
    return get().getAvailableCredits();
  },

  beginGenerationReservation: () => {
    const s = get();
    const user = useUserStore.getState().user;

    const shouldReservePaidCredit =
      !!user && (s.guestFreeLeft ?? 0) <= 0 && get().getAvailableCredits() > 0;

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
