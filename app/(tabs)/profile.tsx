import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useAuthStore, useModalsStore, useUserStore } from '@/stores';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useCreditsStore } from '@/stores/creditStore';
import { useFocus } from '@/hooks';
import { BinaryUpdateButton } from '@/updates/BinaryUpdateButton';
import { Button } from '@/components/ui/button';
import { UserCredits } from '@/components/user/UserCredits/UserCredits';
import { ButtonWithConfirm } from '@/components/ButtonWithConfirm';

export default function UserScreen() {
  const { t } = useTranslation();
  const [isDeleteRequestLoading, setIsDeleteRequestLoading] = useState(false);

  const { user } = useUserStore();
  const { load: loadCredits } = useCreditsStore();
  const { logout, requestUserDataDeletion } = useAuthStore();
  const { openPaywall } = useModalsStore();

  const name = user?.username ?? '';
  const email = user?.email ?? '';
  const avatarUrl = user?.avatar ?? null;

  const initials = useMemo(() => {
    const parts = (name || '').trim().split(/\s+/);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }, [name]);

  const onFeedback = useCallback(() => {
    router.push('/feedback');
  }, []);

  const onLogout = useCallback(() => {
    Alert.alert(t('profile.confirmLogout'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();

          router.replace('/try-on');
        },
      },
    ]);
  }, [logout, t]);

  const onRequestDataDeletion = useCallback(
    async (password?: string) => {
      try {
        setIsDeleteRequestLoading(true);
        await requestUserDataDeletion(password || '');

        Toast.show({
          type: 'success',
          text1: t('profile.dataDeletionRequested'),
        });

        router.replace('/try-on');
      } finally {
        setIsDeleteRequestLoading(false);
      }
    },
    [requestUserDataDeletion, t],
  );

  useFocus(() => {
    loadCredits();
  }, []);

  if (!user) return <Redirect href="/signin" />;

  return (
    <Container title={t('profile.title')} childrenStyle={s.containerBody}>
      <View>
        <View style={s.header}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarPlaceholder]}>
              <Text style={s.avatarText}>{initials.toUpperCase()}</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={s.name}>{name}</Text>
            {!!email && <Text style={s.email}>{email}</Text>}
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{t('profile.title')}</Text>
          <Row icon="person.fill" label={t('profile.name')} value={name} />
          {!!email && (
            <Row
              icon="paperplane.fill"
              label={t('profile.email')}
              value={email}
            />
          )}
        </View>

        <UserCredits showReservedCredits={false} />

        <Button onPress={() => openPaywall()} style={s.paywallLink} transparent>
          See paywall
        </Button>
      </View>

      <View style={s.actions}>
        <Pressable style={s.primaryBtn} onPress={onFeedback}>
          <Text style={s.btnText}>{t('profile.sendFeedback')}</Text>
        </Pressable>

        <Pressable style={s.outlineBtn} onPress={onLogout}>
          <Text style={s.outlineBtnText}>{t('profile.logout')}</Text>
        </Pressable>

        <View style={s.footerActions}>
          <BinaryUpdateButton style={{ marginTop: 100 }} />
        </View>
      </View>

      <View style={s.accountSection}>
        <Text style={s.accountTitle}>{t('profile.accountSectionTitle')}</Text>
        <Text style={s.accountSubtitle}>
          {t('profile.accountSectionBadge')}
        </Text>
        <Text style={s.accountDescription}>
          {t('profile.accountSectionDescription')}
        </Text>
        <ButtonWithConfirm
          onPress={onRequestDataDeletion}
          isLoading={isDeleteRequestLoading}
          style={s.deleteBtn}
          transparent
          alertText={t('profile.confirmDataDeletionTitle')}
          alertDescription={t('profile.confirmDataDeletionText')}
          confirmText={t('profile.requestDataDeletion')}
          requirePassword
          passwordPlaceholder={t('profile.deleteDataPasswordPlaceholder')}
          passwordErrorText={t('profile.deleteDataPasswordRequired')}
        >
          <Text style={s.deleteBtnText}>
            {t('profile.requestDataDeletion')}
          </Text>
        </ButtonWithConfirm>
      </View>
    </Container>
  );
}

function Row({
  icon,
  label,
  value,
  copy,
}: {
  icon: string;
  label: string;
  value: string;
  copy?: boolean;
}) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text numberOfLines={1} style={s.rowValue}>
        {value}
      </Text>
      {copy && (
        <Pressable onPress={() => {}} style={{ marginLeft: 8 }}>
          <IconSymbol name="chevron-right" size={18} color="#9CA3AF" />
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#111827' },
  name: { fontSize: 20, fontWeight: '800' },
  email: { color: '#6B7280' },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { marginLeft: 8, color: '#111827' },
  rowValue: { color: '#374151', maxWidth: '60%' },
  containerBody: { justifyContent: 'space-between' },
  actions: { gap: 10, marginTop: 40, marginBottom: 16 },
  footerActions: { marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  primaryBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtnText: { color: '#111827', fontWeight: '700' },
  paywallLink: {
    marginTop: 20,
    marginBottom: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
  },
  accountSection: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 10,
  },
  accountTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  accountSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#B91C1C',
  },
  accountDescription: {
    color: '#7F1D1D',
    lineHeight: 20,
  },
  deleteBtn: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
