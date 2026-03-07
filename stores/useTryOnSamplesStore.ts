import { create } from 'zustand';
import { fetchTryOnSamples, TTryOnSample } from '@/api/task.api';

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
      set({
        error: e?.message ?? 'Failed to load try-on samples',
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
