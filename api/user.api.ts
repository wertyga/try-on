import { baseQuery } from './base';

import { TUser } from '@/types/user';
import { Categories } from '@/types';

export const fetchSelfUser = async (): Promise<{
  user: TUser | null;
  deviceId: string;
}> => {
  const {
    data: { user, deviceId },
  } = await baseQuery({
    method: 'get',
    url: '/users/self',
    silentError: true,
  });

  return { user, deviceId };
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
