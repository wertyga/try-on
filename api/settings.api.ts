import { TSettings } from '@/types';
import { baseQuery } from '@/api/base-query';

export async function fetchSettings(): Promise<TSettings> {
  const { data } = await baseQuery<TSettings>({
    method: 'get',
    url: '/settings',
  });

  return data;
}
