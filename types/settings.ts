export type TSettings = {
  _id: string;
  guestFreeLimit: number;
  authorizedDailyFreeLimit: number;
  onboardingBonusCredits: number;
  defaultAutoRefillPackId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};
