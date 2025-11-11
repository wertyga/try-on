import { baseQuery } from './base-query';

import { User } from '@/types/user';

export const fetchSelfUser = async (): Promise<User> => {
  const { data } = await baseQuery({
    method: 'get',
    url: '/users/self',
    silentError: true,
  });

  return data;
};
