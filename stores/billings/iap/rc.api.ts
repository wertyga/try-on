import { baseQuery } from '@/api/base';

export async function fetchIAPConfig(): Promise<{ apiKey: string }> {
  const { data } = await baseQuery<{ apiKey: string }>({
    method: 'get',
    url: '/billing/iap/config',
  });

  return data;
}

export async function checkIAPTransaction(body: {
  productId: string;
  transactionId: string;
}): Promise<{ success: boolean }> {
  const { data } = await baseQuery<{ success: boolean }>({
    method: 'post',
    url: '/billing/iap/check-transaction',
    data: body,
  });

  return data;
}
