import { Text, View, StyleSheet } from 'react-native';
import React, { FC, useMemo } from 'react';
import { Colors } from '@/constants/Colors';

function formatTimeLeft(resetsAt: string | null) {
  if (!resetsAt) return null;
  const end = new Date(resetsAt).getTime();
  const diff = end - Date.now();
  if (!Number.isFinite(end) || diff <= 0) return 'Resets soon';
  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `Resets in ${h}h ${m}m` : `Resets in ${m}m`;
}

export const UserBalance: FC<{
  resetsAt: string | null;
  freeDailyLeft: number;
  credits: number;
  guestFreeLeft: number;
}> = ({ resetsAt, credits, guestFreeLeft, freeDailyLeft }) => {
  const timeLeft = useMemo(() => formatTimeLeft(resetsAt), [resetsAt]);

  return (
    <View>
      <View style={s.rowBetween}>
        <Text style={s.title}>Your balance</Text>
        {!!timeLeft && <Text style={s.muted}>{timeLeft}</Text>}
      </View>

      <View style={s.line}>
        <Text style={s.label}>Free today</Text>
        <Text style={s.value}>{freeDailyLeft ?? 0}</Text>
      </View>

      <View style={s.line}>
        <Text style={s.label}>Credits</Text>
        <Text style={s.value}>{credits ?? 0}</Text>
      </View>

      {(guestFreeLeft ?? 0) > 0 ? (
        <View style={s.line}>
          <Text style={s.label}>Guest free</Text>
          <Text style={s.value}>{guestFreeLeft ?? 0}</Text>
        </View>
      ) : null}

      <Text style={s.hint}>Free resets daily. Credits never expire.</Text>
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  label: { color: '#6B7280', fontWeight: '700' },
  value: { fontWeight: '900', color: '#111827' },
});
