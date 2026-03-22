import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomModal } from '@/components/ui/BottomModal';
import { Colors } from '@/constants/Colors';
import { AuthContent } from '@/components/auth/AuthContent';

type LoginModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const LoginModal: FC<LoginModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();

  const title = t('profile.titleLogin');

  return (
    <BottomModal visible={visible} onClose={onClose}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>
          Sign in to save your looks and sync your account.
        </Text>
      </View>
      <AuthContent
        onAuthSuccess={onClose}
        onMaybeLaterPress={onClose}
        resetKey={visible}
        showMaybeLater
      />
    </BottomModal>
  );
};

const s = StyleSheet.create({
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 10,
  },
});
