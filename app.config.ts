import { ConfigContext, ExpoConfig } from 'expo/config';

import * as os from 'os';

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface as any) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return '0.0.0.0';
}

const ENVS = {
  // API_BASE_URL: 'https://api.zws.ink',
  API_BASE_URL: `http://${getLocalIP()}:3001`,
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'try-on',
  slug: 'try-on',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'tryon',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.wertyga.tryon',
    supportsTablet: true,
    infoPlist: {
      NSCameraUsageDescription:
        'Allow $(PRODUCT_NAME) to use the camera to take your photo.',
      NSPhotoLibraryUsageDescription:
        'Allow $(PRODUCT_NAME) to access your photo library.',
      NSPhotoLibraryAddUsageDescription:
        'Allow $(PRODUCT_NAME) to save photos.',
    },
  },
  splash: {
    image: './assets/splash_t.png',
    resizeMode: 'contain',
    backgroundColor: '#0F172A',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#0F172A',
      monochromeImage: './assets/icon.png',
    },
    googleServicesFile: './google-services.json',
    edgeToEdgeEnabled: true,
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
    package: 'com.wertyga.tryon',
  },
  plugins: [
    [
      'expo-updates',
      {
        username: 'wertyga13',
      },
    ],
    'expo-localization',
    'expo-router',
    [
      '@react-native-google-signin/google-signin',
      {
        iosUrlScheme:
          'com.googleusercontent.apps.277624245533-hmaoaah21er9j4b7le8rhgeu9tvpogcr',
      },
    ],
    '@react-native-firebase/app',
  ],
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
    ...ENVS,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/fb5b533f-70bc-4b73-a453-a0028be64c33',
  },
});
