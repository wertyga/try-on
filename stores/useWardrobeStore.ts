import { useEffect } from 'react';

import { create } from 'zustand';
import type { WardrobeItem } from '@/types';
import {
  fetchWardrobeMine,
  addWardrobeItem,
  removeWardrobeItem,
} from '@/api/wardrobe';
import { useUserStore } from '@/stores/useUserStore';
import { TryOnTask, useTryOnStore } from '@/stores/useTryOnStore';
import { TaskStatus } from '@/types/task';

type WardrobeState = {
  items: WardrobeItem[];
  error: string | null;
  isLoading: boolean;
  isFetching: boolean;
  isSaving: boolean;

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
  isFetching: false,
  isSaving: false,

  get count() {
    return get().items.length;
  },

  async fetchMine() {
    if (get().isFetching) return;

    set({ isFetching: true, error: null });
    try {
      const data = await fetchWardrobeMine();

      set({ items: data.items });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load wardrobe' });
    } finally {
      set({ isFetching: false });
    }
  },

  async refresh() {
    await get().fetchMine();
  },

  clear() {
    set({ items: [], error: null });
  },

  async add(task: TryOnTask) {
    try {
      set({ isSaving: true });

      if (task.status !== TaskStatus.completed || !task.id) {
        throw new Error('Only completed tasks can be saved to wardrobe');
      }

      const real = await addWardrobeItem({
        taskId: task.id,
      });

      set((s) => ({
        items: [real, ...s.items],
      }));

      useTryOnStore.getState().removeTask(task.id);
    } catch (e) {
      throw e;
    } finally {
      set({ isSaving: false });
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
