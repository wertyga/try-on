import { TBillingState } from './credit.types';
import { baseQuery } from '@/api/base';

export async function fetchBillingState(): Promise<TBillingState> {
  const { data } = await baseQuery<TBillingState>({
    method: 'get',
    url: '/billing/state',
    silentError: true,
  });

  return data;
}

// export type TPaymentSheetParams = {
//   paymentId: string;
//   paymentIntentClientSecret: string;
//   customerId: string;
//   ephemeralKeySecret: string;
//   publishableKey: string;
// };

// export async function createPaymentSheet(
//   priceId: string,
// ): Promise<TPaymentSheetParams> {
//   const { data } = await baseQuery<TPaymentSheetParams>({
//     method: 'post',
//     url: '/billing/payment-sheet',
//     data: { priceId },
//   });
//
//   return data;
// }
//
// export async function fetchPayment(
//   paymentId: string,
// ): Promise<{ status: PaymentStatus }> {
//   const { data } = await baseQuery<{
//     status: PaymentStatus;
//   }>({
//     method: 'get',
//     url: `/billing/payments/${paymentId}`,
//   });
//
//   return data;
// }

// export async function fetchStripeConfig(): Promise<{ publishableKey: string }> {
//   const { data } = await baseQuery<{ publishableKey: string }>({
//     method: 'get',
//     url: '/billing/config',
//   });
//
//   return data;
// }
