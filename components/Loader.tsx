import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

export type TLoaderOverlayProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;
  subtitle?: string;
};

export const LoaderOverlay = ({
  style,
  title,
  subtitle,
}: TLoaderOverlayProps) => {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('common.loading');

  return (
    <View style={[s.container, style]}>
      <View style={[s.content]}>
        <ActivityIndicator size="large" />
        <Text style={s.title}>{resolvedTitle}</Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
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
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 8,
    color: Colors.light.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    color: Colors.light.textLight,
    textAlign: 'center',
  },
});
