import { baseQuery } from './base-query';

import { TUser } from '@/types/user';
import { Categories } from '@/types';

export const fetchSelfUser = async (): Promise<TUser> => {
  const { data } = await baseQuery({
    method: 'get',
    url: '/users/self',
    silentError: true,
  });

  return data;
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
