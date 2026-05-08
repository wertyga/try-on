import { baseQuery } from '@/api/base';
import { TNews } from '@/types';

export async function fetchLatestNews(): Promise<TNews | null> {
  const { data } = await baseQuery<TNews | null>({
    method: 'get',
    url: '/news/latest',
    silentError: true,
  });

  return data;
}
