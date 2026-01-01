import { create } from 'zustand';
import { getTryOnTaskFromTask, storage } from '@/utils';
import { fetchSelfUser, updateUserCategories } from '@/api/user.api';
import { TUser } from '@/types';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { useCreditsStore } from '@/stores/creditStore';
import { deviceId } from '@/utils/hash';

type Status = 'idle' | 'loading' | 'ready';

type UserStore = {
  status: Status; // когда status === 'ready' — init завершён
  user: TUser | null;
  error: string | null;
  preferredProductCategories: string[];

  setUser: (u: TUser | null) => void;
  dropUser: () => void; // logout: очищает storage и user
  updateUserCategories: (categories?: string[]) => void; // logout: очищает storage и user

  getUserSelf: () => Promise<void>;

  deviceId: string;

  updateUserTasks: () => void;
  updateDeviceId: (deviceId: string) => void;
};

export const useUserStore = create<UserStore>((set, get) => ({
  status: 'idle',
  user: null,
  error: null,
  preferredProductCategories: [],

  deviceId: '',

  updateDeviceId: (deviceIdKey: string) => {
    deviceId.set(deviceIdKey);
    set({ deviceId: deviceIdKey });
  },

  setUser: (user) => {
    if (user?.token) {
      storage.set?.('token', user.token);
    }

    set({ user, error: null });
  },

  updateUserCategories: async (categories: string[] = []) => {
    const storedCategories = await storage.preferredProductCategories;
    const user = get().user;

    const allCategories: string[] = Array.from(
      new Set([
        ...(storedCategories ?? []),
        ...(user?.categories ?? []),
        ...categories,
      ]),
    ) as string[];

    storage.preferredProductCategories = allCategories;

    set({ preferredProductCategories: allCategories });

    if (user) {
      await updateUserCategories(allCategories);
    }
  },

  dropUser: () => {
    storage.delete?.('token');

    set({ user: null, error: null, status: 'ready' });
  },

  updateUserTasks: () => {
    const user = get().user;

    if (!user) return;

    useTryOnStore
      .getState()
      .addTasksList(user.tasks.map((t) => getTryOnTaskFromTask(t, t._id)));
  },

  getUserSelf: async () => {
    if (get().status === 'loading') return;

    set({ status: 'loading', error: null });

    try {
      const { user, deviceId } = await fetchSelfUser();

      set({ user });

      get().updateDeviceId(deviceId);

      if (user) {
        get().updateUserTasks();
        get().updateUserCategories();
      }

      await useCreditsStore.getState().load();

      set({ user, status: 'ready' });
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
