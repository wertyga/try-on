import { ExpoConfig } from 'expo/config';
import {
  androidConfig,
  iosConfig,
  pluginsConfig,
} from './config/app.config.js';

const VERSION = '2.1.0';
export const ANDRIOD_VERSION = 10;

export default (): ExpoConfig => ({
  name: 'try-on',
  slug: 'try-on',
  version: VERSION,
  runtimeVersion: VERSION,
  orientation: 'portrait',
  icon: './assets/icon_black_bg.png',
  scheme: 'tryon',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: iosConfig(VERSION),
  splash: {
    image: './assets/splash_t.png',
    resizeMode: 'contain',
    backgroundColor: '#0F172A',
  },
  android: androidConfig(ANDRIOD_VERSION),
  plugins: pluginsConfig,
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'fb5b533f-70bc-4b73-a453-a0028be64c33',
    },
    updates: {
      assetPatternsToBeBundled: ['**/*'],
    },
  },
  updates: {
    url: 'https://u.expo.dev/fb5b533f-70bc-4b73-a453-a0028be64c33',
  },
});
