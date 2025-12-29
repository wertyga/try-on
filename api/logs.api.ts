import { baseQuery } from './base';

export const sendLogs = async (data: any): Promise<void> => {
  try {
    await baseQuery({
      method: 'post',
      url: '/logs',
      data,
    });
  } catch (e) {}
};
