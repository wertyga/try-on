import { baseQuery } from './base-query';

import { SuccessResponse } from '@/types';
import { Language, User, UserFavoritesResponse } from '@/types/user';

export const fetchSelfUser = async (): Promise<User> => {
  const { data } = await baseQuery({
    method: 'get',
    url: '/users/self',
    silentError: true,
  });

  return data;
};

export const fetchFavorites = async (): Promise<UserFavoritesResponse> => {
  const { data } = await baseQuery({
    method: 'get',
    url: '/users/favorites',
  });

  return data;
};

export type UpdateUserReq = Partial<
  Omit<User, 'lastCity'> & { lastCity: string }
>;
export const updateSelf = async (userData: UpdateUserReq): Promise<User> => {
  const {
    data: { user },
  } = await baseQuery({
    method: 'put',
    url: '/users/update',
    data: userData,
  });

  return user;
};

export const updateSelfCityAPI = async (
  city: string
): Promise<SuccessResponse> => {
  const { data } = await baseQuery({
    method: 'post',
    url: '/users/users-city',
    data: {
      city,
    },
  });

  return data;
};


export const fetchLanguages = async (): Promise<{ languages: Language[] }> => {
  const { data } = await baseQuery(
    {
      method: 'get',
      url: '/users/languages',
    },
  );

  return data;
};
