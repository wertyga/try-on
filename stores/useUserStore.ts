import { create } from 'zustand';
import { getTryOnTaskFromTask, storage } from '@/utils';
import { fetchSelfUser, updateUserCategories } from '@/api/user.api';
import { TUser } from '@/types';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { useCreditsStore } from '@/stores/creditStore';
import { useAppStore } from '@/stores/appStore';

type Status = 'idle' | 'loading' | 'ready';

export type TUserStoreState = {
  status: Status; // когда status === 'ready' — init завершён
  user: TUser | null;
  error: string | null;
  preferredProductCategories: string[];
};

export type TUserStoreActions = {
  setUser: (u: TUser | null) => void;
  dropUser: () => Promise<void>; // logout: очищает storage и user
  updateUserCategories: (categories?: string[]) => void; // logout: очищает storage и user

  getUserSelf: (withTaskListReplace?: boolean) => Promise<void>;

  updateUserTasks: (withTaskListReplace?: boolean) => void;
};

type TUserStore = TUserStoreState & TUserStoreActions & {};

export const useUserStore = create<TUserStore>((set, get) => ({
  status: 'idle',
  user: null,
  error: null,
  preferredProductCategories: [],

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

  dropUser: async () => {
    await storage.delete?.('token');

    set({ user: null, error: null, status: 'ready' });
  },

  updateUserTasks: (withTaskListReplace?: boolean) => {
    const user = get().user;

    if (!user) return;

    const newTaskList = user.tasks.map((t) => getTryOnTaskFromTask(t, t._id));

    if (withTaskListReplace) {
      useTryOnStore.getState().updateTasksState(newTaskList);
    } else {
      useTryOnStore.getState().addTasksList(newTaskList);
    }
  },

  getUserSelf: async (withTaskListReplace?: boolean) => {
    if (get().status === 'loading') return;

    set({ status: 'loading', error: null });

    try {
      const { user, deviceId } = await fetchSelfUser();

      set({ user });

      useAppStore.getState().updateDeviceId(deviceId);

      if (user) {
        get().updateUserTasks(withTaskListReplace);
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
