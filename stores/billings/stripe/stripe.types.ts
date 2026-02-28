export enum PaymentStatus {
  pending = 'pending',
  succeeded = 'succeeded',
  failed = 'failed',
}

export type TStripeProductPack = {
  id: string; // packId (metadata.packId)
  priceId: string; // Stripe price id
  title: string;
  description: string;
  credits: number;
  priceLabel: string;
  marketFeatures: { name: string }[];
  isActive?: boolean;
};

export type TPaymentSheetParams = {
  paymentId: string;
  paymentIntentClientSecret: string;
  customerId: string;
  ephemeralKeySecret: string;
  publishableKey: string;
};
