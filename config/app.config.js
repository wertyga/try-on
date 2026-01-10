export const iosConfig = (version) => ({
  bundleIdentifier: 'com.wertyga.tryon',
  supportsTablet: true,
  buildNumber: version.toString(),
  googleServicesFile: './GoogleService-Info.plist',
  infoPlist: {
    NSCameraUsageDescription:
      'Allow $(PRODUCT_NAME) to use the camera to take your photo.',
    NSPhotoLibraryUsageDescription:
      'Allow $(PRODUCT_NAME) to access your photo library.',
    NSPhotoLibraryAddUsageDescription: 'Allow $(PRODUCT_NAME) to save photos.',
    LSApplicationQueriesSchemes: ['itms-apps'],
  },
});

export const androidConfig = (version) => {
  return {
    versionCode: version,
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
  };
};

export const pluginsConfig = [
  ['@react-native-firebase/app'],
  [
    'expo-build-properties',
    {
      ios: {
        useFrameworks: 'static',
        extraPods: [
          { name: 'GoogleUtilities', modular_headers: true },
          { name: 'FirebaseCoreInternal', modular_headers: true },
        ],
      },
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
];
