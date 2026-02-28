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
