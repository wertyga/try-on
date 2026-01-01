import { create } from 'zustand';
import { TProduct } from '@/types';
import { fetchDefineImagesToCategories, fetchPreferredProducts } from '@/api';
import { useUserStore } from '@/stores/useUserStore';
import * as Localization from 'expo-localization';

export type TProductsStoreState = {
  recommendedProducts: TProduct[];
  prevFetchedCategories: string[];
};

export type TProductsStoreActions = {
  fetchProductsByInnerCategories: () => Promise<void>;
  fetchCategoriesForImages: (
    images: Parameters<typeof fetchDefineImagesToCategories>[0],
  ) => Promise<void>;
};

export type TProductsStore = TProductsStoreState & TProductsStoreActions & {};

export const useProductsStore = create<TProductsStore>((set, get) => {
  return {
    recommendedProducts: [],
    prevFetchedCategories: [],

    fetchProductsByInnerCategories: async () => {
      const zone = Localization.getLocales()?.[0]?.regionCode ?? 'US';
      const userCategories = useUserStore.getState().preferredProductCategories;

      if (!userCategories.length) return;

      const products = await fetchPreferredProducts({
        categories: userCategories,
        zone,
        limit: 50,
      });

      set({
        recommendedProducts: products,
        prevFetchedCategories: userCategories,
      });
    },

    fetchCategoriesForImages: async (
      images: Parameters<typeof fetchDefineImagesToCategories>[0],
    ) => {
      const categories = await fetchDefineImagesToCategories(images);

      useUserStore.getState().updateUserCategories(categories);
    },
  };
});
