import { create } from 'zustand';
import { fetchTryOnPresets, createTaskByPreset } from '@/api/task.api';
import { buildAPIError } from '@/api/base';
import { useTryOnStore } from './useTryOnStore';
import { getTryOnTaskFromTask } from '@/utils';
import { hash } from '@/utils/hash';
import { TTask } from '@/types/task';
import { useCreditsStore } from '@/stores/creditStore';

export type TTryOnPreset = {
  _id: string;
  image: string;
  title: string;
};

type TTryOnPresetsState = {
  presets: TTryOnPreset[];
  isLoading: boolean;
  creatingPresetId?: string;
  error: string | null;
};

type TTryOnPresetsActions = {
  fetchPresets: () => Promise<void>;
  createTaskWithPreset: (params: {
    presetId: string;
    image: string;
    presetImage?: string;
    taskId?: string;
  }) => Promise<TTask | undefined>;
};

type TTryOnPresetsStore = TTryOnPresetsState & TTryOnPresetsActions;

export const useTryOnPresetsStore = create<TTryOnPresetsStore>((set, get) => ({
  presets: [],
  isLoading: false,
  creatingPresetId: undefined,
  error: null,

  fetchPresets: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const presets = await fetchTryOnPresets();

      set({ presets });
    } catch (e: any) {
      set({
        error: buildAPIError(e, 'Failed to load try-on presets').message,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  createTaskWithPreset: async ({ presetId, image, presetImage, taskId }) => {
    set({ creatingPresetId: presetId, error: null });

    try {
      const payload = {
        presetId,
        imageBase64: image,
        taskId,
      };
      const { task } = await createTaskByPreset(payload);
      const nextTask = getTryOnTaskFromTask(
        task,
        `${presetId}|${hash(image)}`,
        false,
      );

      if (presetImage) {
        nextTask.assets.preset = presetImage;
      }

      useTryOnStore.getState().addTask(nextTask);

      await useCreditsStore.getState().onGenerationSuccess();

      return task;
    } catch (e: any) {
      const { message } = buildAPIError(e, 'Failed to create preset try-on');

      set({ error: message });
    } finally {
      set({ creatingPresetId: undefined });
    }
  },
}));
