import { baseQuery } from './base-query';
import { SetLikeRequest, SetLikeResponse } from '@/types';

export const setLike = async (
  data: SetLikeRequest
): Promise<SetLikeResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/like',
    data,
  });

  return response;
};
