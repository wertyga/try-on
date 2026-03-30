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
          router.replace('/(tabs)/try-on');
        },
      },
    ]);
  }, [logout, t]);

  useFocus(() => {
    loadCredits();
  }, []);

  if (!user) return <Redirect href="/login" />;

  return (
    <Container childrenStyle={s.containerBody}>
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
    marginBottom: 14,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9E0D8',
    backgroundColor: '#FFFCF9',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: '#E9E0D8',
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#2F2A25' },
  name: { fontSize: 24, fontWeight: '500', color: '#2F2A25' },
  email: { color: '#9D9288' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  card: {
    backgroundColor: '#FFFCF9',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9E0D8',
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '600', marginBottom: 8, fontSize: 18, color: '#2F2A25' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 2,
  },
  statNum: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#6B7280', fontSize: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFE8E1',
  },
  rowLabel: { marginLeft: 8, color: '#2F2A25' },
  rowValue: { color: '#5E554D', maxWidth: '60%' },

  containerBody: { justifyContent: 'space-between' },

  actions: { gap: 10, marginTop: 24, marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  primaryBtn: {
    backgroundColor: '#D3B08B',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineBtn: {
    backgroundColor: '#FFFCF9',
    borderWidth: 1,
    borderColor: '#E9E0D8',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineBtnText: { color: '#2F2A25', fontWeight: '700' },

  muted: { color: '#9CA3AF', textAlign: 'center', marginTop: 6 },

  paywallLink: {
    marginTop: 20,
    marginBottom: 6,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E0D8',
    backgroundColor: '#FFFCF9',
  },
});
