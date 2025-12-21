import { TSettings } from '@/types/settings';

export type TCreditPack = {
  id: string; // packId (metadata.packId)
  priceId: string; // Stripe price id
  title: string;
  description: string;
  credits: number;
  priceLabel: string;
  marketFeatures: { name: string }[];
  bestValue?: boolean;
  isActive?: boolean;
};

export type TBillingState = {
  // settings
  settings: TSettings;
  guestFreeLimit: number;
  authorizedDailyFreeLimit: number;
  onboardingBonusCredits: number;
  defaultAutoRefillPackId: string | null;

  // packs
  packs: TCreditPack[];

  // guest state
  guestFreeUsed?: number;
  guestFreeLeft?: number;

  // user state
  freeDailyUsed?: number;
  freeDailyLeft?: number;
  credits?: number;

  // UX
  resetsAt: string; // ISO string
  autoRefillEnabled?: boolean;
};
