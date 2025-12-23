import { TUser } from '@/types/user';

export enum FeedbackStatus {
  new = 'new',
  inProgress = 'in_progress',
  resolved = 'resolved',
}

export type TFeedback = {
  message: string;

  // optional contacts
  email?: string;

  // context
  user?: TUser | string;
  deviceId?: string;

  appVersion?: string;
  platform?: 'ios' | 'android' | 'web';

  status: FeedbackStatus;

  meta?: Record<string, any>;

  createdAt: string;
};

export type CreateFeedbackRequest = Omit<TFeedback, 'status' | 'createdAt'> & {
  status?: FeedbackStatus;
};
