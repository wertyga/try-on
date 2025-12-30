import { baseQuery } from './base';

export const sendLogs = async (
  data: { errorTitle?: string } & any,
): Promise<void> => {
  try {
    await baseQuery({
      method: 'post',
      url: '/logs',
      data,
    });
  } catch (e) {}
};
