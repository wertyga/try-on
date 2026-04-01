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
  resetsAt: string | null;
  freeDailyLeft: number;
  credits: number;
  reservedCredits?: number;
  guestFreeLeft: number;
}> = ({ resetsAt, credits, reservedCredits = 0, guestFreeLeft, freeDailyLeft }) => {
  const { t } = useTranslation();
  // const timeLeft = useMemo(() => formatTimeLeft(resetsAt, t), [resetsAt, t]);

  return (
    <View>
      <View style={s.rowBetween}>
        <Text style={s.title}>Your balance</Text>
        {/*{!!timeLeft && <Text style={s.muted}>{timeLeft}</Text>}*/}
      </View>

      {/*<View style={s.line}>*/}
      {/*  <Text style={s.label}>Free today</Text>*/}
      {/*  <Text style={s.value}>{freeDailyLeft ?? 0}</Text>*/}
      {/*</View>*/}

      <View style={s.line}>
        <Text style={s.label}>Credits</Text>
        <Text style={s.value}>{credits ?? 0}</Text>
      </View>

      {reservedCredits > 0 ? (
        <View style={s.line}>
          <Text style={s.label}>Reserved</Text>
          <Text style={s.value}>{reservedCredits}</Text>
        </View>
      ) : null}

      {(guestFreeLeft ?? 0) > 0 ? (
        <View style={s.line}>
          <Text style={s.label}>Guest free</Text>
          <Text style={s.value}>{guestFreeLeft ?? 0}</Text>
        </View>
      ) : null}

      {/*<Text style={s.hint}>Free resets daily. Credits never expire.</Text>*/}
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  label: { color: '#6B7280', fontWeight: '700' },
  value: { fontWeight: '900', color: '#111827' },
});
