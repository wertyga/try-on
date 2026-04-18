export type TCreditPack = {
  id: string; // packId (metadata.packId)
  priceId: string; // Stripe price id
  title: string;
  description: string;
  credits: number;
  priceLabel: string;
  marketFeatures: { name: string }[];
  isActive?: boolean;
};

export type TBillingState = {
  guestFreeUsed?: number;
  guestFreeLeft?: number;
  guestCredits: number;
  paidCredits?: number;
};
