import { TryOnTaskAssets } from '@/stores/useTryOnStore';
import { TTryOnSample } from '@/stores';

export type WardrobeItem = {
  _id: string;
  title?: string;
  imageUrl: string;
  createdAt: string;
  sample: TTryOnSample;
  assets: TryOnTaskAssets;
};

export type TSaveWardrobeAssetsPayload = {
  assets: TryOnTaskAssets;
};
export type TSaveWardrobeSamplePayload = {
  sampleId: string;
};

export type TSaveWardrobePayload = {
  title?: string;
  imageUrl: string;
} & (TSaveWardrobeAssetsPayload | TSaveWardrobeSamplePayload);
