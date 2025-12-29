import { TSettings } from '@/types';
import { baseQuery } from './base';

export async function fetchSettings(): Promise<TSettings> {
  const { data } = await baseQuery<TSettings>({
    method: 'get',
    url: '/settings',
  });

  return data;
}
