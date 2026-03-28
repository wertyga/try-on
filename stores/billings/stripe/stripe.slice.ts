import { create } from 'zustand';

import {
  fetchStripeConfig,
  fetchStripePacks,
  createPaymentSheet,
  fetchPayment,
} from './stripe.api';
import { PaymentStatus, TStripeProductPack } from './stripe.types';

import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';

export type TStripeSliceState = {
  publishableKey: string;
};

export type TStripeActionsSlice = {
  fetchStripeKey: () => Promise<void>;
  fetchProductsPacks: () => Promise<TStripeProductPack[]>;
  waitPayment: (paymentId: string, timeoutMs?: number) => Promise<boolean>;
  buyStripeProduct: (packId: string) => Promise<void>;
};

export type TStripeStore = TStripeSliceState & TStripeActionsSlice & {};

const WAIT_PAYMENT_TIMEOUT_MS = 30000;
const WAIT_PAYMENT_INTERVAL_MS = 1000;

export const useStripeStore = create((set: any, get: any): TStripeStore => {
  return {
    publishableKey: '',

    fetchProductsPacks: async (): Promise<TStripeProductPack[]> => {
      const { packs } = await fetchStripePacks();

      const activePacks = (packs ?? []).filter(
        (p: TStripeProductPack) => p.isActive !== false,
      );

      return activePacks;
    },

    fetchStripeKey: async () => {
      const cfg = await fetchStripeConfig();

      set({ publishableKey: cfg.publishableKey });
    },

    waitPayment: async (paymentId: string) => {
      const started = Date.now();

      while (Date.now() - started < WAIT_PAYMENT_TIMEOUT_MS) {
        const res = await fetchPayment(paymentId);
        console.log({ res });
        if (res.status === PaymentStatus.succeeded) {
          return true;
        }

        if (res.status === PaymentStatus.failed) {
          throw new Error('Payment failed');
        }

        await new Promise((r) => setTimeout(r, WAIT_PAYMENT_INTERVAL_MS));
      }

      throw new Error('Payment confirmation timeout');
    },

    buyStripeProduct: async (priceId: string) => {
      const ps = await createPaymentSheet(priceId);

      const init = await initPaymentSheet({
        merchantDisplayName: 'TryOn',
        customerId: ps.customerId,
        customerEphemeralKeySecret: ps.ephemeralKeySecret,
        paymentIntentClientSecret: ps.paymentIntentClientSecret,
        allowsDelayedPaymentMethods: false,
      });

      if (init.error) {
        throw init.error;
      }

      const present = await presentPaymentSheet();

      if (present.error) {
        throw present.error;
      }

      await get().waitPayment(ps.paymentId);
    },
  };
});
