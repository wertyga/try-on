import { baseQuery } from './base';
import { TProduct } from '@/types';

export type TPreferredProductsRequest = {
  categories: string[];
  zone: string;
  limit?: number;
};
export async function fetchPreferredProducts(
  params: TPreferredProductsRequest,
): Promise<TProduct[]> {
  const {
    data: { products },
  } = await baseQuery({
    method: 'get',
    url: '/product/list',
    params,
  });

  return products;
}
