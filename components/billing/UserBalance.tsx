import { Text, View, StyleSheet } from 'react-native';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

function formatTimeLeft(
  resetsAt: string | null,
  t: (key: string, options?: Record<string, number>) => string,
) {
  if (!resetsAt) return null;

  const end = new Date(resetsAt).getTime();
  const diff = end - Date.now();

  if (!Number.isFinite(end) || diff <= 0) {
    return t('credits.labels.resetsSoon');
  }

  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  return h > 0
    ? t('credits.labels.resetsIn', { h, m })
    : t('credits.labels.resetsInMinutes', { m });
}

export const UserBalance: FC<{
  availableCredits: number;
  reservedCredits?: number;
  guestFreeLeft: number;
}> = ({ availableCredits, reservedCredits = 0, guestFreeLeft }) => {
  return (
    <View>
      <View style={s.rowBetween}>
        <Text style={s.title}>Your balance</Text>
      </View>

      <View style={[s.line, { paddingBottom: 8 }]}>
        <Text style={s.label}>Total available credits</Text>
        <Text style={s.value}>{availableCredits ?? 0}</Text>
      </View>

      {reservedCredits > 0 ? (
        <View style={s.line}>
          <Text style={s.label}>Reserved</Text>
          <Text style={s.value}>{reservedCredits}</Text>
        </View>
      ) : null}

      {(guestFreeLeft ?? 0) > 0 ? (
        <View style={s.line}>
          <Text style={s.label}>Free Credits</Text>
          <Text style={s.value}>{guestFreeLeft ?? 0}</Text>
        </View>
      ) : null}
    </View>
  );
};

const s = StyleSheet.create({
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  title: { fontSize: 16, fontWeight: '900' },

  muted: { color: Colors.light.textDisabled, fontWeight: '700' },
  hint: { marginTop: 8, color: '#6B7280', fontSize: 12 },

  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  label: { color: '#6B7280', fontWeight: '700' },
  value: { fontWeight: '900', color: '#111827' },
});
