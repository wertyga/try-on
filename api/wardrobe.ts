import { baseQuery } from './base';
import { TSaveWardrobePayload, WardrobeItem } from '@/types';

export async function fetchWardrobeMine(): Promise<{
  items: WardrobeItem[];
  total: number;
}> {
  const { data } = await baseQuery({ method: 'get', url: '/wardrobe/mine' });
  return data;
}

export async function addWardrobeItem(
  payload: TSaveWardrobePayload,
): Promise<WardrobeItem> {
  const { data } = await baseQuery({
    method: 'post',
    url: '/wardrobe',
    data: payload,
  });
  return data.item;
}

export async function getWardrobeItem(id: string): Promise<WardrobeItem> {
  const { data } = await baseQuery({ method: 'get', url: `/wardrobe/${id}` });
  return data.item;
}

export async function removeWardrobeItem(id: string): Promise<void> {
  await baseQuery({ method: 'delete', url: `/wardrobe/${id}` });
}
