import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SplashScreen } from '@/components/SplashScreen';

export const LoadingScreen = () => {
  const { t } = useTranslation();

  return (
    <SplashScreen>
      <View>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: '#ffffff' }}>
          {t('common.loading')}
        </Text>
      </View>
    </SplashScreen>
  );
};
