import * as Updates from 'expo-updates';

enum Channels {
  Production = 'production',
  Development = 'development',
  Preview = 'preview',
}

const commonConfig = {
  ANDROID_PACKAGE: 'com.wertyga.tryon',
  IOS_APP_ID: 'YOUR_APP_ID',
  MIN_ANDROID_VERSION_CODE: 7,
  MIN_IOS_BUILD_NUMBER: 6,
};

const inAppConfigMap = {
  [Channels.Production]: {
    API_URL: 'https://api.zws.ink',

    ...commonConfig,
  },
  [Channels.Development]: {
    API_URL: `http://192.168.18.4:3001`,
    ...commonConfig,
  },
  [Channels.Preview]: {
    API_URL: 'https://api.zws.ink',
    ...commonConfig,
  },
};

const DEFAULT_CHANNEL = __DEV__ ? Channels.Development : Channels.Production;

const channel = (Updates.channel as Channels) || DEFAULT_CHANNEL;

export const inAppConfig =
  inAppConfigMap[channel] ?? inAppConfigMap[DEFAULT_CHANNEL];
