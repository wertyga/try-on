import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useUserStore, useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';

type Props = {
  /** Hide the banner when user is logged in (default: true) */
  hideWhenAuthed?: boolean;
  /** Custom copy if you need */
  title?: string;
  subtitle?: string;
  /** Navigate somewhere else instead of default /login */
  onSignInPress?: () => void;
  /** Extra styles */
  style?: StyleProp<ViewStyle>;
  /** Compact row layout (smaller paddings) */
  compact?: boolean;
};

export const SaveLooksGate: React.FC<Props> = ({
  title = 'Save and sync your looks',
  subtitle = 'Create an account to keep your try-ons across devices.',
  onSignInPress,
  style,
  compact,
}) => {
  const { isLoading: isAuthLoading } = useAuthStore();
  const user = useUserStore((s) => s.user);

  const { t } = useTranslation();

  if (user) return null;

  const goLogin = () => {
    router.push('/signin');
  };

  return (
    <View style={[s.card, compact && s.cardCompact, style]}>
      <View style={s.iconWrap}>
        <MaterialIcons name="grid-view" size={20} color="#111827" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>

      {isAuthLoading && <ActivityIndicator />}
      {!isAuthLoading && (
        <Button onPress={goLogin} style={s.cta} dark>
          {t('auth.signIn')}
        </Button>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    marginVertical: 16,
  },
  cardCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  title: { fontWeight: '800', fontSize: 14, color: '#111827' },
  subtitle: { color: '#6B7280', marginTop: 2, fontSize: 12 },
  cta: { paddingHorizontal: 14, minHeight: 36 },
});

export default SaveLooksGate;
