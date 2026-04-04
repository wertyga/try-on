import { baseQuery } from './base';

import { UserResponse } from '@/types';

export const oauthGoogleRegister = async (data: {
  email: string;
  username: string;
}): Promise<UserResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/oauth/google',
    data,
  });

  return response;
};

export const oauthAppleRegister = async (data: {
  authorizationCode: string;
  identityToken: string;
}): Promise<UserResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/oauth/apple',
    data,
  });

  return response;
};

export const requestUserDataDeletion = async (
  password: string,
): Promise<void> => {
  await baseQuery({
    method: 'post',
    url: '/auth/remove-data',
    data: {
      password,
    },
  });
};
