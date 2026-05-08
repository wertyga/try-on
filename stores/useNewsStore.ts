import { create } from 'zustand';
import { fetchLatestNews } from '@/api';
import { TNews } from '@/types';
import { STORAGE_KEYS, storage } from '@/utils';

type TNewsStoreState = {
  latestNews: TNews | null;
  isNewsModalOpen: boolean;
  isLoading: boolean;
  error: string | null;
};

type TNewsStoreActions = {
  initialize: () => Promise<void>;
  closeLatestNews: () => Promise<void>;
};

export type TNewsStore = TNewsStoreState & TNewsStoreActions;

export const useNewsStore = create<TNewsStore>((set, get) => ({
  latestNews: null,
  isNewsModalOpen: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const latestNews = await fetchLatestNews();

      if (!latestNews?.hash) {
        set({ latestNews: null, isNewsModalOpen: false });
        return;
      }

      const viewedNewsHash = await storage.viewedNewsHash;
      const hasSeenNews = viewedNewsHash === latestNews.hash;

      set({
        latestNews,
        isNewsModalOpen: !hasSeenNews,
      });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load news' });
    } finally {
      set({ isLoading: false });
    }
  },

  closeLatestNews: async () => {
    const latestNews = get().latestNews;

    set({ isNewsModalOpen: false });

    if (!latestNews?.hash) return;

    await storage.set(STORAGE_KEYS.ViewedNewsHash, latestNews.hash);
  },
}));
