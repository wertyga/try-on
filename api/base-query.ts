import Toast from 'react-native-toast-message';

import axios, { AxiosRequestConfig } from 'axios';
import { storage } from '@/utils';
import Constants from 'expo-constants';
import { Analytics } from '@/analytics';
import { deviceId } from '@/utils/hash';

const buildParams = (
  params?: Record<string, string | number | string[]>,
): Record<string, string | number> => {
  if (!params) return {};

  const result: Record<string, string | number> = {};

  for (const key in params) {
    let value = params[key];
    if (Array.isArray(value)) {
      value = value.join(',');
    }

    result[key] = value;
  }

  return result;
};

export const baseQuery = async ({
  headers,
  silentError,
  params,
  ...config
}: AxiosRequestConfig & { silentError?: boolean }) => {
  try {
    const [token, dvId] = await Promise.all([
      storage.get('token'),
      deviceId.get(),
    ]);

    const authHeader: AxiosRequestConfig['headers'] = {};
    if (token) {
      authHeader['Authorization'] = `Bearer ${token}`;
    }

    const data = await axios.request({
      headers: {
        ...authHeader,
        ...headers,
        ['x-device-id']: dvId,
      },
      baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
      params: buildParams(params),
      ...config,
    } as AxiosRequestConfig);

    return { data: data?.data } as any;
  } catch (e: any) {
    console.log({ e });
    if (!silentError) {
      Analytics.event('error', { place: 'tryon_poll', message: e?.message });

      Toast.show({
        type: 'error',
        text1: e.response?.data?.error?.message || e.message,
      });
    }

    throw e;
  }
};
