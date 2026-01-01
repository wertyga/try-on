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
    silentError: true,
  });

  return products;
}

export async function fetchDefineImagesToCategories(data: {
  dressBase64?: string;
  upperBase64?: string;
  lowerBase64?: string;
}): Promise<string[]> {
  const {
    data: { categories },
  } = await baseQuery({
    method: 'post',
    url: '/product/image-category',
    data,
    silentError: true,
  });

  return categories;
}
