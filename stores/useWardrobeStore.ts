import { useEffect } from 'react';

import { create } from 'zustand';
import type { WardrobeItem } from '@/types';
import {
  fetchWardrobeMine,
  addWardrobeItem,
  removeWardrobeItem,
} from '@/api/wardrobe';
import { useUserStore } from '@/hooks/useUserStore';
import { TryOnTask, useTryOnStore } from '@/hooks/useTryOnStore';

type WardrobeState = {
  items: WardrobeItem[];
  error: string | null;
  isLoading: boolean;

  // derived
  count: number;

  // actions
  fetchMine: () => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;

  add: (task: TryOnTask) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  error: null,
  isLoading: false,

  get count() {
    return get().items.length;
  },

  async fetchMine() {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const data = await fetchWardrobeMine();

      set({ items: data.items });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load wardrobe' });
    } finally {
      set({ isLoading: false });
    }
  },

  async refresh() {
    await get().fetchMine();
  },

  clear() {
    set({ items: [], error: null });
  },

  async add(task: TryOnTask, meta?: { title: string }) {
    try {
      set({ isLoading: true });

      const real = await addWardrobeItem({
        imageUrl: task.resultImageUrl as string,
        assets: task.assets,
        title: meta?.title,
      });

      set((s) => ({
        items: [real, ...s.items],
      }));

      useTryOnStore.getState().removeTask(task.id);
    } catch (e) {
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },

  async remove(id) {
    // оптимистично скрываем
    const prev = get().items;
    set({ items: prev.filter((i) => i._id !== id) });
    try {
      await removeWardrobeItem(id);
    } catch (e) {
      set({ items: prev });
      throw e;
    }
  },
}));

export function useWardrobeAutoSync() {
  const user = useUserStore((s) => s.user);
  const fetchMine = useWardrobeStore((s) => s.fetchMine);
  const clear = useWardrobeStore((s) => s.clear);

  useEffect(() => {
    if (user) fetchMine();
    else clear();
  }, [user, fetchMine, clear]);
}
