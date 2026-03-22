import { Platform } from 'react-native';

import Toast from 'react-native-toast-message';

import axios, { AxiosRequestConfig } from 'axios';
import { storage } from '@/utils';
import { buildAPIError } from './base-query.utils';
import Constants from 'expo-constants';
import { Analytics } from '@/analytics';
import { deviceId } from '@/utils/hash';
import { inAppConfig } from '@/config';
import { useAppStore } from '@/stores/appStore';

const buildNumber = Constants.expoConfig?.extra?.buildNumber;

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
      useAppStore.getState().appDeviceId,
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
      baseURL: inAppConfig.API_URL,
      params: buildParams(params),
      ...config,
    } as AxiosRequestConfig);

    return { data: data?.data } as any;
  } catch (e: any) {
    const { message, status } = buildAPIError(e);

    if (!silentError && status !== 403) {
      Analytics.event('error', { place: 'tryon_poll', message });

      Toast.show({
        type: 'error',
        text1: message,
      });
    }

    throw e;
  }
};
