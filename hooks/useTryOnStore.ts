import { create } from 'zustand';
import { Analytics } from '@/analytics';

type Source = 'camera' | 'gallery';

export type UserPhoto = {
  uri: string;
  base64?: string;
  width?: number;
  height?: number;
  source?: Source;
} | null;

export type GarmentImage = { uri: string; base64?: string } | null;
export type GarmentMode = 'dress' | 'separate';

export type TTryOnPayloadWardrobeKeys =
  | 'dressBase64'
  | 'upperBase64'
  | 'lowerBase64';

export type TryOnPayload = Partial<
  Record<TTryOnPayloadWardrobeKeys, string>
> & {
  mode: GarmentMode;
  userBase64: string;
};

export type TryOnTaskAssets = {
  model: string;
  dress?: string;
  upper?: string;
  lower?: string;
};

export type TryOnTask = {
  id: string; // task_id из PiAPI
  status: 'queued' | 'running' | 'completed' | 'failed';
  fingerprint: string; // для дедупликации
  payload: TryOnPayload; // чтобы можно было «Попробовать ещё»
  resultUrl?: string | null;
  error?: string | null;
  createdAt: number;
  isSaved: boolean;
  assets: TryOnTaskAssets;
};

type TryOnState = {
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

  addTask: (t: TryOnTask) => void;
  addBunchTasks: (t: TryOnTask[]) => void;
  updateTask: (id: string, patch: Partial<TryOnTask>) => void;
  removeTask: (id: string) => void;
  clearFinished: () => void;
};

export const useTryOnStore = create<TryOnState>((set) => ({
  userPhoto: null,
  mode: 'dress',
  dress: null,
  upper: null,
  lower: null,

  tasks: [],

  consent: false,
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

  setUserPhoto: (userPhoto) => set({ userPhoto }),
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

  addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),
  addBunchTasks: (tasks) => set((s) => ({ tasks: [...tasks, ...s.tasks] })),
  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),
  removeTask: (id) => {
    Analytics.event('tryon_task_remove', { task_id: id });
    set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) }));
  },
  clearFinished: () => {
    Analytics.event('queue_clear_finished');

    set((s) => ({
      tasks: s.tasks.filter(
        (x) => x.status !== 'completed' && x.status !== 'failed',
      ),
    }));
  },
}));
