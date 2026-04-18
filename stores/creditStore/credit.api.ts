import { TBillingState } from './credit.types';
import { baseQuery } from '@/api/base';
import { TPayment } from '@/types/payment';

export async function fetchBillingState(): Promise<TBillingState> {
  const { data } = await baseQuery<TBillingState>({
    method: 'get',
    url: '/billing/state',
    silentError: true,
  });

  return data;
}

export async function fetchHasSucceededPayment(): Promise<TPayment | null> {
  const { data } = await baseQuery<{ payment: TPayment | null }>({
    method: 'get',
    url: '/billing/payments/succeeded',
  });

  return data.payment;
}
