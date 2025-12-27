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
