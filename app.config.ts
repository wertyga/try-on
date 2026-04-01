import { ExpoConfig } from 'expo/config';
const {
  androidConfig,
  iosConfig,
  pluginsConfig,
} = require('./config/app.config.js');

const VERSION = '4.0.3';
export const BUILD_VERSION = 15;

export default (): ExpoConfig => ({
  name: 'try-on',
  slug: 'try-on',
  version: VERSION,
  runtimeVersion: VERSION,
  orientation: 'portrait',
  icon: './assets/icon_black_bg.png',
  scheme: 'tryon',
  userInterfaceStyle: 'automatic',
  ios: iosConfig(BUILD_VERSION),
  splash: {
    image: './assets/splash_t.png',
    resizeMode: 'contain',
    backgroundColor: '#0F172A',
  },
  android: androidConfig(BUILD_VERSION),
  plugins: pluginsConfig as any,
  experiments: {
    typedRoutes: true,
  },
  extra: {
    buildNumber: BUILD_VERSION,
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
