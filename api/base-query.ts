import { Platform } from 'react-native';

import Toast from 'react-native-toast-message';

import axios, { AxiosRequestConfig } from 'axios';
import { storage } from '@/utils';
import Constants from 'expo-constants';
import { Analytics } from '@/analytics';
import { useForceUpdateStore } from '@/hooks/useForceUpdateStore';

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

export const baseQuery = async ({
  headers,
  silentError,
  params,
  ...config
}: AxiosRequestConfig & { silentError?: boolean }) => {
  try {
    const token = await storage.get('token');

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
      },
      baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
      params: buildParams(params),
      ...config,
    } as AxiosRequestConfig);

    return { data: data?.data } as any;
  } catch (e: any) {
    if (e.response?.status === 426) {
      useForceUpdateStore.getState().setRequired({
        minBuild: e.response?.minBuild,
        message: e.response?.message || 'Please update the app to continue.',
      });
    }

    if (!silentError && e.response?.status !== 403) {
      Analytics.event('error', { place: 'tryon_poll', message: e?.message });

      Toast.show({
        type: 'error',
        text1: e.response?.data?.error?.message || e.message,
      });
    }

    throw e;
  }
};
