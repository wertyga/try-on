export enum PaymentStatus {
  pending = 'pending',
  succeeded = 'succeeded',
  failed = 'failed',
}

export type TPayment = {
  credits: number;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
};
