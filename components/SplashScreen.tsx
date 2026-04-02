import Splash from '@/assets/splash_t.png';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

export const SplashScreen = ({ children }: { children?: any }) => {
  const { width } = Dimensions.get('window');

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        ...StyleSheet.absoluteFillObject,
      }}
    >
      <Image
        source={Splash}
        style={{
          width: width * 0.8,
          height: width * 0.8,
        }}
      />

      {children}
    </View>
  );
};
