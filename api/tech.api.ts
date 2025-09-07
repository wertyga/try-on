import { baseQuery } from './base-query';

import { SendHelpMessageReq, SuccessResponse } from '@/types';

export const fetchEnvs = async () => {
  const { data } = await baseQuery({
    method: 'get',
    url: '/tech/env',
  });

  return data;
};

export const sendHelpMessage = async (
  data: SendHelpMessageReq
): Promise<SuccessResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/tech/help',
    data,
  });

  return response;
};
