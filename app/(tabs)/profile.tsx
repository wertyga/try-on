import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useModalsStore, useUserStore } from '@/stores';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';
import { useCreditsStore } from '@/stores/creditStore';
import { useFocus } from '@/hooks';
import { BinaryUpdateButton } from '@/updates/BinaryUpdateButton';
import { Button } from '@/components/ui/button';
import { UserCredits } from '@/components/user/UserCredits/UserCredits';

export default function UserScreen() {
  const { t } = useTranslation();

  const { user } = useUserStore();
  const { load: loadCredits } = useCreditsStore();
  const { logout } = useAuthStore();
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
        onPress: () => {
          logout();
          router.replace('/try-on');
        },
      },
    ]);
  }, [logout, t]);

  useFocus(() => {
    loadCredits();
  }, []);

  if (!user) return <Redirect href="/login" />;

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

        <UserCredits />

        <Button onPress={openPaywall} style={s.paywallLink} transparent>
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

        <BinaryUpdateButton style={{ marginTop: 100 }} />
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
  actions: { gap: 10, marginTop: 40, marginBottom: 10 },
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
});
