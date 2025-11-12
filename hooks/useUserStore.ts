import { create } from 'zustand';
import { storage } from '@/utils';
import { fetchSelfUser, updateUserCategories } from '@/api/user.api';
import { Categories, TUser } from '@/types';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';

type Status = 'idle' | 'loading' | 'ready';

type UserStore = {
  status: Status; // когда status === 'ready' — init завершён
  user: TUser | null;
  error: string | null;

  init: () => Promise<void>;
  setUser: (u: TUser | null) => void;
  dropUser: () => void; // logout: очищает storage и user
  updateUserCategories: (categories?: Categories[]) => void; // logout: очищает storage и user
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

  init: async () => {
    if (get().status === 'loading') return;

    set({ status: 'loading', error: null });

    try {
      const token = (await storage.get?.('token')) as string | null;

      if (!token) {
        set({ user: null, status: 'ready' });
        return;
      }

      const me = await fetchSelfUser();

      set({ user: me, status: 'ready' });
    } catch (e: any) {
      const status = e?.status || e?.response?.status;
      if (status === 401 || status === 404) {
        storage.delete?.('token');
      }
      set({ user: null, status: 'ready', error: e?.message ?? 'Auth failed' });
    }
  },
}));
