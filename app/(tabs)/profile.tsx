import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/hooks/useUserStore';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Container } from '@/components/ui/Container';

export default function UserScreen() {
  const { t } = useTranslation();
  const { user, dropUser } = useUserStore();

  const name = user?.username ?? '';
  const email = user?.email ?? '';
  const avatarUrl = user?.avatar ?? null;

  const initials = useMemo(() => {
    const parts = (name || '').trim().split(/\s+/);
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
  }, [name]);

  const onLogout = useCallback(() => {
    Alert.alert(t('profile.confirmLogout'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: () => {
          dropUser();
          router.replace('/welcome');
        },
      },
    ]);
  }, [dropUser, t]);

  if (!user) return <Redirect href="/login" />;

  return (
    <Container.WithScrollBar>
      {/* Header */}
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

      {/* Info */}
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

      {/* Actions */}
      <View style={s.actions}>
        <Pressable style={s.outlineBtn} onPress={onLogout}>
          <Text style={s.outlineBtnText}>{t('profile.logout')}</Text>
        </Pressable>
      </View>
    </Container.WithScrollBar>
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
      {/* <IconSymbol name={icon} size={18} color="#6B7280" /> */}
      <Text style={s.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text numberOfLines={1} style={s.rowValue}>
        {value}
      </Text>
      {copy && (
        <Pressable onPress={() => {}} style={{ marginLeft: 8 }}>
          <IconSymbol name="chevron.right" size={18} color="#9CA3AF" />
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
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '800', marginBottom: 8 },

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

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowLabel: { marginLeft: 8, color: '#111827' },
  rowValue: { color: '#374151', maxWidth: '60%' },

  actions: { gap: 10, marginTop: 6, marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  outlineBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  outlineBtnText: { color: '#111827', fontWeight: '700' },

  muted: { color: '#9CA3AF', textAlign: 'center', marginTop: 6 },
});
