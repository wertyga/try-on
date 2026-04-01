const iosConfig = (version) => ({
  bundleIdentifier: 'com.wertyga.tryon',
  supportsTablet: true,
  usesAppleSignIn: true,
  buildNumber: version.toString(),
  googleServicesFile: './GoogleService-Info.plist',
  infoPlist: {
    NSCameraUsageDescription:
      'We use the camera to take your photo so you can try on outfits and see how clothes look on you in real time.',
    NSPhotoLibraryUsageDescription:
      'We use your photo library so you can choose a photo of yourself to apply virtual outfits and preview try-on results.',
    NSPhotoLibraryAddUsageDescription:
      'We save your try-on results (generated outfit images) to your photo library when you tap Save.',
    LSApplicationQueriesSchemes: ['itms-apps'],
  },
});

const androidConfig = (version) => {
  return {
    versionCode: version,
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#0F172A',
      monochromeImage: './assets/icon.png',
    },
    // googleServicesFile: './google-services.json',
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

const pluginsConfig = [
  ['expo-apple-authentication'],
  ['expo-iap'],
  [
    'expo-build-properties',
    {
      ios: {
        useFrameworks: 'static',
      },
    },
  ],
  // '/Users/alexejbronshtein/WebstormProjects/try-on/config/withFirebaseModularHeaders',
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

module.exports = {
  iosConfig,
  pluginsConfig,
  androidConfig,
};
