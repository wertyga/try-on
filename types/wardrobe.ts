import { TryOnTaskAssets } from '@/stores/useTryOnStore';

export type WardrobeItem = {
  _id: string;
  user?: string;
  title?: string;
  imageUrl: string;
  createdAt: string;
  sample?: {
    image?: string;
    title?: string;
  };
  preset?: {
    image?: string;
    title?: string;
  };
  assets: TryOnTaskAssets;
};

export type TSaveWardrobePayload = {
  taskId: string;
};
