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

const VERSION = '2.0.0';
const ANDRIOD_VERSION = 7;

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'try-on',
  slug: 'try-on',
  version: VERSION,
  runtimeVersion: VERSION,
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
      LSApplicationQueriesSchemes: ['itms-apps'],
    },
  },
  splash: {
    image: './assets/splash_t.png',
    resizeMode: 'contain',
    backgroundColor: '#0F172A',
  },
  android: {
    versionCode: ANDRIOD_VERSION,
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#0F172A',
      monochromeImage: './assets/icon.png',
    },
    googleServicesFile: './google-services.json',
    edgeToEdgeEnabled: true,
    permissions: [
      'CAMERA',
      'READ_MEDIA_IMAGES',
      'READ_EXTERNAL_STORAGE',
      'com.google.android.gms.permission.AD_ID',
    ],
    package: 'com.wertyga.tryon',
  },
  plugins: [
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'com.test.test',
        enableGooglePay: false,
      },
    ],
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
          'com.googleusercontent.apps.876705886550-69onectr8996dlrdjko1s1o8hjaovlj1',
      },
    ],
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
  updates: {
    url: 'https://u.expo.dev/fb5b533f-70bc-4b73-a453-a0028be64c33',
  },
});
