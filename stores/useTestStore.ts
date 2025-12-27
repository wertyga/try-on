import { create } from 'zustand';

export const useTestStore = create<any>((set, get) => ({
  messages: [],

  setMessage: (message: string) =>
    set({ messages: [JSON.stringify(message, null, 2), ...get().messages] }),
}));
