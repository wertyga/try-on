import { TBillingState, TSettings } from '@/types';
import { baseQuery } from '@/api/base-query';

export async function fetchBillingState(): Promise<TBillingState> {
  const { data } = await baseQuery<TBillingState>({
    method: 'get',
    url: '/billing/state',
  });

  return data;
}

export type TPaymentSheetParams = {
  paymentIntentClientSecret: string;
  customerId: string;
  ephemeralKeySecret: string;
  publishableKey: string;
};

export async function createPaymentSheet(
  priceId: string,
): Promise<TPaymentSheetParams> {
  const { data } = await baseQuery<TPaymentSheetParams>({
    method: 'post',
    url: '/billing/payment-sheet',
    data: { priceId },
  });

  return data;
}

export async function fetchStripeConfig(): Promise<{ publishableKey: string }> {
  const { data } = await baseQuery<{ publishableKey: string }>({
    method: 'get',
    url: '/billing/config',
  });

  return data;
}
