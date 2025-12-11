import { create } from 'zustand';
import { Analytics } from '@/analytics';
import { TaskStatus, TTask } from '@/types/task';
import { getFinishedTask, removeTask } from '@/api';
import { getTryOnTaskFromTask, storage } from '@/utils';
import { useUserStore } from '@/hooks/useUserStore';

type Source = 'camera' | 'gallery';

export type UserPhoto = {
  uri: string;
  base64: string;
} | null;

export type GarmentImage = { uri: string; base64?: string } | null;
export type GarmentMode = 'dress' | 'separate';

export type TryOnPayload = {
  dressBase64?: string;
  upperBase64?: string;
  lowerBase64?: string;
  mode: GarmentMode;
  userBase64: string;
};

export type TryOnTaskAssets = {
  model: string;
  dress?: string;
  upper?: string;
  lower?: string;
};

export type TryOnTask = TTask & {
  id: string;
  fingerprint: string; // для дедупликации
  isSaved: boolean;
  assets: TryOnTaskAssets;
  mode: GarmentMode;
};

type TryOnState = {
  //abort controllers
  abortControllers: Record<string, AbortController>;

  // входы
  userPhoto: UserPhoto;
  mode: GarmentMode;
  dress: GarmentImage;
  upper: GarmentImage;
  lower: GarmentImage;

  consent: boolean;
  setConsent: (consent: boolean) => void;

  clearDress: () => void;
  clearUpper: () => void;
  clearLower: () => void;

  // задачи
  tasks: TryOnTask[];

  // setters / helpers
  setUserPhoto: (p: UserPhoto) => void;
  setMode: (m: GarmentMode) => void;
  setDress: (g: GarmentImage) => void;
  setUpper: (g: GarmentImage) => void;
  setLower: (g: GarmentImage) => void;
  resetInputs: () => void;

  clearFinished: () => void;

  fetchFinishedTask: (id: string) => void;

  addTasksList: (tasks: TryOnTask[]) => void;
  updateTasksState: (tasks: TryOnTask[]) => void;
  removeTask: (id: string) => void;
  addTask: (t: TryOnTask) => void;
  addBunchTasks: (t: TryOnTask[]) => void;
  updateTask: (id: string, patch: Partial<TryOnTask>) => void;

  clear: () => void;

  init: () => Promise<void>;
};

export const useTryOnStore = create<TryOnState>((set, get) => ({
  userPhoto: null,
  mode: 'dress',
  dress: null,
  upper: null,
  lower: null,

  tasks: [],

  abortControllers: {},

  consent: false,

  init: async () => {
    const userPhoto = await storage.get('userPhoto');

    set({ userPhoto });
  },

  setConsent: (consent: boolean) => {
    Analytics.event('consent_photo_processing', { value: consent });

    set({ consent });
  },

  clearDress: () => {
    Analytics.event('garment_clear', { slot: 'dress' });

    set({ dress: null });
  },
  clearUpper: () => {
    Analytics.event('garment_clear', { slot: 'upper' });

    set({ upper: null });
  },
  clearLower: () => {
    Analytics.event('garment_clear', { slot: 'lower' });

    set({ lower: null });
  },

  setUserPhoto: (userPhoto: UserPhoto) => {
    storage.set('userPhoto', userPhoto);

    set({ userPhoto });
  },

  setMode: async (mode) => {
    set((state) =>
      mode === 'dress'
        ? { mode, upper: null, lower: null }
        : { mode, dress: null },
    );

    await Analytics.event('garment_mode_set', { mode });
    Analytics.userProp('tryon_mode', mode);
  },
  setDress: (dress) => set({ dress }),
  setUpper: (upper) => set({ upper }),
  setLower: (lower) => set({ lower }),
  resetInputs: () =>
    set({ dress: null, upper: null, lower: null /* userPhoto оставим */ }),

  addTask: (t) => {
    const updatedTaskList = [t, ...get().tasks];
    storage.set('userPhoto', { uri: t.assets.model, base64: t.assets.model });

    get().updateTasksState(updatedTaskList);
  },
  addBunchTasks: (tasks) => set((s) => ({ tasks: [...tasks, ...s.tasks] })),

  updateTask: (id, patch) => {
    const updatedTaskList = get().tasks.map((x) =>
      x.id === id ? { ...x, ...patch } : x,
    );

    get().updateTasksState(updatedTaskList);
  },

  removeTask: (id) => {
    Analytics.event('tryon_task_remove', { task_id: id });

    const user = useUserStore.getState().user;
    const updatedTaskList = get().tasks.filter((x) => x.id !== id);

    get().updateTasksState(updatedTaskList);

    if (user) {
      removeTask(id);
    }
  },

  updateTasksState: (tasks: TryOnTask[]) => {
    set({ tasks });

    storage.set('tasks', tasks);
  },

  addTasksList: (tasks: TryOnTask[]) => {
    const map = new Map<string, TryOnTask>();

    tasks.forEach((t) => map.set(t.id, t));

    get().tasks.forEach((t) => map.set(t.id, t));

    const updated = Array.from(map.values());

    set({ tasks: updated });
    storage.set('tasks', updated);
  },

  clear: () => {
    set({ tasks: [] });
    get().resetInputs();

    storage.set('tasks', []);
  },

  clearFinished: () => {
    Analytics.event('queue_clear_finished');

    const updatedTaskList = get().tasks.filter(
      (x) =>
        x.status !== TaskStatus.completed && x.status !== TaskStatus.failed,
    );

    storage.set('tasks', updatedTaskList);

    set({ tasks: updatedTaskList });
  },

  fetchFinishedTask: async (id: string) => {
    try {
      const abortController = get().abortControllers[id];
      abortController?.abort();

      get().abortControllers[id] = new AbortController();

      const task = await getFinishedTask(id, get().abortControllers[id].signal);

      get().updateTask(id, getTryOnTaskFromTask(task));

      useUserStore.getState().getUserSelf();
    } catch (e: any) {
      get().updateTask(id, { error: e.message, status: TaskStatus.failed });
    }
  },
}));
