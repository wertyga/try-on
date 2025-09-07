import {
  ActivityIndicator,
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Splash from '@/assets/splash_t.png';

export const LoadingScreen = () => {
  const { t } = useTranslation();

  const { width } = Dimensions.get('window');
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        ...StyleSheet.absoluteFillObject,
        paddingTop: 200,
      }}
    >
      <Image
        source={Splash}
        style={{
          width: width * 0.8,
          height: width * 0.8,
        }}
      />

      <View>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: '#ffffff' }}>
          {t('common.loading')}
        </Text>
      </View>
    </View>
  );
};
