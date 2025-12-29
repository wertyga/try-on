import { baseQuery } from '@/api/base';
import {
  PaymentStatus,
  TProductPack,
  TPaymentSheetParams,
} from './stripe.types';

export async function fetchStripeConfig(): Promise<{ publishableKey: string }> {
  const { data } = await baseQuery<{ publishableKey: string }>({
    method: 'get',
    url: '/billing/config',
  });

  return data;
}

export async function fetchStripePacks(): Promise<{ packs: TProductPack[] }> {
  const { data } = await baseQuery<{ packs: TProductPack[] }>({
    method: 'get',
    url: '/billing/packs',
  });

  return data;
}

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

export async function fetchPayment(
  paymentId: string,
): Promise<{ status: PaymentStatus }> {
  const { data } = await baseQuery<{
    status: PaymentStatus;
  }>({
    method: 'get',
    url: `/billing/payments/${paymentId}`,
  });

  return data;
}
