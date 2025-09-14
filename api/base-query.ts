import Toast from 'react-native-toast-message';

import axios, { AxiosRequestConfig } from 'axios';
import { storage } from '@/utils';
import Constants from 'expo-constants';

export const baseQuery = async ({
  headers,
  silentError,
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
      },
      baseURL: Constants.expoConfig?.extra?.API_BASE_URL,
      ...config,
    } as AxiosRequestConfig);

    return { data: data?.data } as any;
  } catch (e: any) {
    if (!silentError && e.response?.status !== 403) {
      Toast.show({
        type: 'error',
        text1: e.response?.data.message || e.message,
      });
    }

    throw e;
  }
};
