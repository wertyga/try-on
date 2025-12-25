import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

export const LoaderOverlay = () => {
  const { t } = useTranslation();

  return (
    <View style={s.container}>
      <View style={[s.content]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: Colors.light.text }}>
          {t('common.loading')}
        </Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
  },
});
