import {
  fetchStripeConfig,
  fetchStripePacks,
  createPaymentSheet,
  fetchPayment,
} from './stripe.api';
import { PaymentStatus, TProductPack } from './stripe.types';

import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';

export type TStripeSliceState = {
  packs: TProductPack[];
  publishableKey: string;
};

export type TStripeActionsSlice = {
  fetchStripeKey: () => Promise<void>;
  fetchProductsPacks: () => Promise<void>;
  waitPayment: (paymentId: string, timeoutMs?: number) => Promise<boolean>;
  buyStripeProduct: (packId: string) => Promise<void>;
};

export type TStripeSlice = TStripeSliceState & TStripeActionsSlice & {};

export const StripeSlice = (set: any, get: any): TStripeSlice => {
  return {
    packs: [],
    publishableKey: '',

    fetchProductsPacks: async () => {
      const { packs } = await fetchStripePacks();

      set({
        packs: (packs ?? []).filter((p: TProductPack) => p.isActive !== false),
      });
    },

    fetchStripeKey: async () => {
      const cfg = await fetchStripeConfig();

      set({ publishableKey: cfg.publishableKey });
    },
    waitPayment: async (paymentId: string, timeoutMs = 25000) => {
      const started = Date.now();

      while (Date.now() - started < timeoutMs) {
        const res = await fetchPayment(paymentId);

        if (res.status === PaymentStatus.succeeded) {
          return true;
        }

        if (res.status === PaymentStatus.failed) {
          throw new Error('Payment failed');
        }

        await new Promise((r) => setTimeout(r, 1200));
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
        throw new Error(init.error.message);
      }

      const present = await presentPaymentSheet();

      if (present.error) {
        throw new Error(present.error.message);
      }

      await get().waitPayment(ps.paymentId);
    },
  };
};
