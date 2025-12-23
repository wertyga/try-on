import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { baseQuery } from './base-query';
import { CreateFeedbackRequest, TFeedback } from '@/types';

const mapPlatform = (): 'ios' | 'android' | 'web' => {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  return 'web';
};

export const sendFeedback = async (
  data: CreateFeedbackRequest,
): Promise<TFeedback> => {
  const { data: response } = await baseQuery<TFeedback>({
    method: 'post',
    url: '/feedback',
    data: {
      appVersion: Constants.expoConfig?.version,
      platform: mapPlatform(),
      ...data,
    },
  });

  return response;
};
