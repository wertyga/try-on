import { create } from 'zustand/index';
import { TUsage } from '@/types';
import { deviceId } from '@/utils/hash';

type TUsageStore = {
  deviceId: string;
  count: number;
  isAllowed: boolean;

  update: (usage: Partial<TUsage>) => void;
};

export const useUsageStore = create<TUsageStore>((set, get) => ({
  deviceId: '',
  count: 0,
  isAllowed: false,

  update: async (usage) => {
    set({
      deviceId: usage.deviceId ?? '',
      count: usage.count ?? 0,
      isAllowed: (usage.count as number) > 0,
    });

    if (usage?.deviceId) {
      await deviceId.set(usage.deviceId);
    }
  },
}));
