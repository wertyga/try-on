import { baseQuery } from './base-query';

import { TUser } from '@/types/user';
import { Categories, TUsage } from '@/types';

export const fetchSelfUser = async (): Promise<{
  user: TUser | null;
  usage: TUsage;
}> => {
  const {
    data: { user, usage },
  } = await baseQuery({
    method: 'get',
    url: '/users/self',
    silentError: true,
  });

  return { user, usage };
};

export const updateUserCategories = async (
  categories: Categories[],
): Promise<TUser> => {
  const { data } = await baseQuery({
    method: 'put',
    url: '/users/categories',
    data: {
      categories,
    },
    silentError: true,
  });

  return data.user;
};

export const fetchDeviceId = async (): Promise<{
  deviceId: string;
  generationsLeft: number;
}> => {
  const { data } = await baseQuery({
    method: 'get',
    url: '/users/device-id',
  });

  const generations = Number(data.generationsLeft);

  return {
    deviceId: data.deviceId,
    generationsLeft: Number.isNaN(generations) ? 1 : generations,
  };
};
