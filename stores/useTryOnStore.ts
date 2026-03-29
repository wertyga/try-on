import { create } from 'zustand';
import { TaskStatus, TTask } from '@/types/task';
import { getFinishedTask, removeTask, retryTaskCreate } from '@/api';
import { getTryOnTaskFromTask, storage } from '@/utils';
import { useUserStore } from '@/stores/useUserStore';
import { useCreditsStore } from '@/stores/creditStore';
import {
  trackCreditSpent,
  trackGenerationCompleted,
  trackTaskCreated,
} from '@/analytics';

export type UserPhoto = {
  uri: string;
  base64: string;
} | null;

export type GarmentImage = { uri: string; base64?: string } | null;
export type GarmentMode = 'dress' | 'separate' | 'preset' | 'sample';

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
  outfit?: string;
  preset?: string;
  glasses?: string;
  hairstyle?: string;
  accessories?: string;
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
  retryTask: (task: TryOnTask) => Promise<void>;

  addTasksList: (tasks: TryOnTask[]) => void;
  updateTasksState: (tasks: TryOnTask[]) => void;
  removeTask: (id: string) => Promise<void>;
  addTask: (t: TryOnTask) => void;
  updateTask: (id: string, patch: Partial<TryOnTask>) => void;

  clear: () => void;

  init: () => Promise<void>;

  getTask: (id: string) => TryOnTask | undefined;
};

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
    const [userPhoto, tasks] = await Promise.all([
      storage.get('userPhoto'),
      storage.get('tasks'),
    ]);

    set({ userPhoto, tasks: tasks ?? [] });
  },

  setConsent: (consent: boolean) => {
    set({ consent });
  },

  clearImage: (slot: TTryOnImagesKeys) => {
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
    set(() =>
      mode === 'dress'
        ? { mode, upper: null, lower: null }
        : { mode, dress: null },
    );
  },

  getTask: (id) => {
    return get().tasks.find((task) => task.id === id);
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

    get().updateTasksState(updatedTaskList);
  },

  updateTask: (id, patch) => {
    const updatedTaskList = get().tasks.map((x) =>
      x.id === id ? { ...x, ...patch } : x,
    );

    get().updateTasksState(updatedTaskList);
  },

  removeTask: async (id) => {
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
    const allTasks = [...tasks, ...get().tasks];

    get().updateTasksState(allTasks);
  },

  clear: () => {
    set({ tasks: [] });
    get().resetInputs();

    storage.set('tasks', []);
  },

  clearFinished: () => {
    const updatedTaskList = get().tasks.filter(
      (x) =>
        x.status !== TaskStatus.completed && x.status !== TaskStatus.failed,
    );

    get().updateTasksState(updatedTaskList);
  },

  fetchFinishedTask: async (id: string) => {
    try {
      const task = await getFinishedTask(id);
      const prevTask = get().getTask(id);
      const nextTask = getTryOnTaskFromTask(task);

      if (prevTask?.assets.preset && !nextTask.assets.preset) {
        nextTask.assets.preset = prevTask.assets.preset;
      }

      if (
        prevTask?.status !== TaskStatus.completed &&
        nextTask.status === TaskStatus.completed
      ) {
        trackGenerationCompleted(id);
      }

      get().updateTask(id, nextTask);

      await useCreditsStore.getState().onGenerationSuccess();
    } catch (e: any) {
      get().updateTask(id, { error: e.message, status: TaskStatus.failed });
    }
  },

  retryTask: async (tryOnTask: TryOnTask) => {
    const payload = {
      userBase64: tryOnTask.assets.model,
      dressBase64: tryOnTask.assets.dress,
      mode: tryOnTask.mode,
      upperBase64: tryOnTask.assets.upper,
      lowerBase64: tryOnTask.assets.lower,
    };

    get().updateTask(tryOnTask.id, {
      status: TaskStatus.queued,
      error: '',
      assets: {
        upper: '',
        dress: '',
        model: '',
        lower: '',
      },
    });

    const { task } = await retryTaskCreate(payload, tryOnTask.id);
    const newTryOnTask = getTryOnTaskFromTask(
      task,
      tryOnTask.fingerprint,
      false,
    );

    trackTaskCreated('retry', task._id);
    trackCreditSpent('retry', task._id);

    get().updateTask(tryOnTask.id, newTryOnTask);
  },
}));
