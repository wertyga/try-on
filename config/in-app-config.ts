import * as Updates from 'expo-updates';

enum Channels {
  Production = 'production',
  Development = 'development',
  Preview = 'preview',
}

const commonConfig = {};

const inAppConfigMap = {
  [Channels.Production]: {
    API_URL: 'https://tryon.carcostatlas.com',
    ...commonConfig,
  },
  [Channels.Development]: {
    API_URL: 'https://tryon.carcostatlas.com',
    ...commonConfig,
  },
  [Channels.Preview]: {
    API_URL: 'https://tryon.carcostatlas.com',
    ...commonConfig,
  },
};

const DEFAULT_CHANNEL = __DEV__ ? Channels.Development : Channels.Production;

const channel = (Updates.channel as Channels) || DEFAULT_CHANNEL;

export const inAppConfig =
  inAppConfigMap[channel] ?? inAppConfigMap[DEFAULT_CHANNEL];
