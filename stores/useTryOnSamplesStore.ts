import { create } from 'zustand';
import { fetchTryOnSamples } from '@/api/task.api';
import { buildAPIError } from '@/api/base';

export type TTryOnSample = {
  _id: string;
  image: string;
  assets: string[];
  title: string;
};

type TTryOnSamplesState = {
  samples: TTryOnSample[];
  isLoading: boolean;
  error: string | null;
};

type TTryOnSamplesActions = {
  fetchSamples: () => Promise<void>;
};

type TTryOnSamplesStore = TTryOnSamplesState & TTryOnSamplesActions;

export const useTryOnSamplesStore = create<TTryOnSamplesStore>((set, get) => ({
  samples: [],
  isLoading: false,
  error: null,

  fetchSamples: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const samples = await fetchTryOnSamples();

      set({ samples });
    } catch (e: any) {
      const { message = 'Failed to load try-on samples' } = buildAPIError(e);

      set({
        error: message,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
