import { TryOnTaskAssets } from '@/hooks/useTryOnStore';

export type WardrobeItem = {
  _id: string;
  title?: string;
  imageUrl: string;
  createdAt: string;
  assets: TryOnTaskAssets;
};

export type TSaveWardrobePayload = {
  title?: string;
  imageUrl: string;
  assets: TryOnTaskAssets;
};
