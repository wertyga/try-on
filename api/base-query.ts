import { Platform } from 'react-native';

import Toast from 'react-native-toast-message';

import axios, { AxiosRequestConfig } from 'axios';
import { buildError, storage } from '@/utils';
import Constants from 'expo-constants';
import { Analytics } from '@/analytics';
import { deviceId } from '@/utils/hash';
import { useForceUpdateStore } from '@/stores';

const buildNumber = Constants.expoConfig?.android?.versionCode ?? 0;

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

export const baseQuery = async <R = any>({
  headers,
  silentError,
  params,
  ...config
}: AxiosRequestConfig & { silentError?: boolean }): Promise<{ data: R }> => {
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
        'x-app-version': String(buildNumber),
        'x-platform': Platform.OS,
        'x-device-id': dvId,
      },
      baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
      params: buildParams(params),
      ...config,
    } as AxiosRequestConfig);

    return { data: data?.data } as any;
  } catch (e: any) {
    const { message } = buildError(e);

    useForceUpdateStore.getState().handleUpdateRequireError(e);

    if (!silentError && e.response?.status !== 403) {
      Analytics.event('error', { place: 'tryon_poll', message });

      Toast.show({
        type: 'error',
        text1: message,
      });
    }

    throw e;
  }
};
