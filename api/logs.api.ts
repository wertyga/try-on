import { baseQuery } from './base-query';

export const sendLogs = async (data: any): Promise<void> => {


  try {
    await baseQuery({
      method: 'post',
      url: '/logs',
      data,
    });
  } catch (e) {}
};
