import { create } from 'zustand';
import { getTryOnTaskFromTask, storage } from '@/utils';
import { fetchSelfUser, updateUserCategories } from '@/api/user.api';
import { Categories, TUser } from '@/types';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';
import { useTryOnStore } from '@/hooks/useTryOnStore';
import { useUsageStore } from '@/hooks/useUsageStore';

type Status = 'idle' | 'loading' | 'ready';

type UserStore = {
  status: Status; // когда status === 'ready' — init завершён
  user: TUser | null;
  error: string | null;

  setUser: (u: TUser | null) => void;
  dropUser: () => void; // logout: очищает storage и user
  updateUserCategories: (categories?: Categories[]) => void; // logout: очищает storage и user

  getUserSelf: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set, get) => ({
  status: 'idle',
  user: null,
  error: null,

  setUser: (user) => {
    if (user?.token) {
      storage.set?.('token', user.token);
    }

    set({ user, error: null });
  },

  updateUserCategories: async (categories: Categories[] = []) => {
    const storedCategories = await storage.preferredProductCategories;
    const user = get().user;

    const allCategories: Categories[] = Array.from(
      new Set([
        ...(storedCategories ?? []),
        ...(user?.categories ?? []),
        ...categories,
      ]),
    ) as Categories[];

    storage.preferredProductCategories = allCategories;

    if (user) {
      await updateUserCategories(allCategories);
    }
  },

  dropUser: () => {
    storage.delete?.('token');

    set({ user: null, error: null, status: 'ready' });

    useWardrobeStore.getState().clear();
  },

  getUserSelf: async () => {
    if (get().status === 'loading') return;

    set({ status: 'loading', error: null });

    try {
      const { user, usage } = await fetchSelfUser();

      set({ user, status: 'ready' });

      useUsageStore.getState().update(usage);

      if (user) {
        useTryOnStore
          .getState()
          .addTasksList(user.tasks.map((t) => getTryOnTaskFromTask(t, t._id)));
        get().updateUserCategories();
      }
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      if (status === 401 || status === 404) {
        storage.delete?.('token');
      }

      set({ user: null, status: 'ready', error: e?.message ?? 'Auth failed' });
    } finally {
      await useTryOnStore.getState().init();
    }
  },
}));
