import { create } from 'zustand';
import { Analytics } from '@/analytics';
import { TaskStatus, TTask } from '@/types/task';
import { getFinishedTask, removeTask } from '@/api';
import { getTryOnTaskFromTask, storage } from '@/utils';
import { useUserStore } from '@/stores/useUserStore';

export type UserPhoto = {
  uri: string;
  base64: string;
} | null;

export type GarmentImage = { uri: string; base64?: string } | null;
export type GarmentMode = 'dress' | 'separate';

export type TryOnPayload = {
  sampleId?: string;

  dressBase64?: string;
  upperBase64?: string;
  lowerBase64?: string;
  glassesBase64?: string;
  accessoriesBase64?: string;
  hairstyleBase64?: string;

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

export type TTryOnImagesKeys =
  | 'dress'
  | 'upper'
  | 'lower'
  | 'glasses'
  | 'hairstyle'
  | 'accessories';
export type TTryOnImages = Record<TTryOnImagesKeys, GarmentImage | null>;

type TryOnState = TTryOnImages & {
  // входы
  userPhoto: UserPhoto;
  mode: GarmentMode;

  consent: boolean;
  setConsent: (consent: boolean) => void;

  clearImage: (slot: TTryOnImagesKeys) => void;
  setImage: (slot: TTryOnImagesKeys, image: GarmentImage) => void;

  // задачи
  tasks: TryOnTask[];

  // setters / helpers
  setUserPhoto: (p: UserPhoto) => void;
  setMode: (m: GarmentMode) => void;
  resetInputs: () => void;

  clearFinished: () => void;

  fetchFinishedTask: (id: string) => void;

  addTasksList: (tasks: TryOnTask[]) => void;
  updateTasksState: (tasks: TryOnTask[]) => void;
  removeTask: (id: string) => Promise<void>;
  addTask: (t: TryOnTask) => void;
  addBunchTasks: (t: TryOnTask[]) => void;
  updateTask: (id: string, patch: Partial<TryOnTask>) => void;

  clear: () => void;

  init: () => Promise<void>;
};

const sortTasks = (arr: TryOnTask[]) =>
  [...arr].sort((a, b) => {
    const da = new Date((a as any).createdAt ?? 0).getTime();
    const db = new Date((b as any).createdAt ?? 0).getTime();
    return db - da; // новые сверху
  });

export const useTryOnStore = create<TryOnState>((set, get) => ({
  userPhoto: null,
  mode: 'dress',

  dress: null,
  upper: null,
  lower: null,
  hairstyle: null,
  glasses: null,
  accessories: null,

  tasks: [],

  consent: false,

  init: async () => {
    const userPhoto = await storage.get('userPhoto');

    set({ userPhoto });
  },

  setConsent: (consent: boolean) => {
    Analytics.event('consent_photo_processing', { value: consent });

    set({ consent });
  },

  clearImage: (slot: TTryOnImagesKeys) => {
    Analytics.event('garment_clear', { slot });

    set({ [slot]: null });
  },

  setImage: (slot: TTryOnImagesKeys, image: GarmentImage) => {
    set({ [slot]: image });
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

  resetInputs: () => {
    set({
      dress: null,
      upper: null,
      lower: null,
      glasses: null,
      hairstyle: null,
      accessories: null,
    });
  },

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

  removeTask: async (id) => {
    Analytics.event('tryon_task_remove', { task_id: id });

    const user = useUserStore.getState().user;

    if (user) {
      await removeTask(id);
    }

    const updatedTaskList = get().tasks.filter((x) => x.id !== id);
    get().updateTasksState(updatedTaskList);
  },

  updateTasksState: (tasks: TryOnTask[]) => {
    set({ tasks });

    storage.set('tasks', tasks);
  },

  addTasksList: (tasks: TryOnTask[]) => {
    const map = new Map<string, TryOnTask>();

    // чтобы данные “обновлялись”, но порядок был по времени — просто мержим и сортим
    for (const t of get().tasks) map.set(t.id, t);
    for (const t of tasks) map.set(t.id, { ...map.get(t.id), ...t });

    const merged = Array.from(map.values());
    const sorted = sortTasks(merged);

    set({ tasks: sorted });
    storage.set('tasks', sorted);
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
      const task = await getFinishedTask(id);

      get().updateTask(id, getTryOnTaskFromTask(task));

      useUserStore.getState().getUserSelf();
    } catch (e: any) {
      get().updateTask(id, { error: e.message, status: TaskStatus.failed });
    }
  },
}));
