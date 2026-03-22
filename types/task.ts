import { TUser } from '@/types/user';
import { GarmentMode } from '@/stores/useTryOnStore';

export enum TaskStatus {
  'completed' = 'completed',
  'failed' = 'failed',
  'running' = 'running',
  'queued' = 'queued',
}

export type TTask = {
  owner?: TUser | string;
  status: TaskStatus;
  _id: string;
  preset?: string;
  sample?: string;
  userImageUrl: string;
  dressImageUrl?: string;
  upperImageUrl?: string;
  lowerImageUrl?: string;
  resultImageUrl?: string;
  outfitImageUrl?: string;
  message?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  mode: GarmentMode;
};
