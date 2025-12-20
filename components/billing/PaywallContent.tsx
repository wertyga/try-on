import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import useCreditsStore from '@/stores/useCreditsStore';
import { Colors } from '@/constants/Colors';
import { PackList } from '@/components/Pack';
import { UserBalance } from '@/components/billing/UserBalance';

export default function PaywallContent() {
  const {
    packs,
    freeDailyLeft,
    credits,
    guestFreeLeft,
    resetsAt,
    isLoading,
    isBuying,
    error,
    // buyPack,
    clearError,
  } = useCreditsStore();

  return (
    <View style={{ gap: 12 }}>
      {/* Balance */}
      <View style={s.card}>
        <UserBalance
          resetsAt={resetsAt}
          credits={credits}
          freeDailyLeft={freeDailyLeft}
          guestFreeLeft={freeDailyLeft}
        />
      </View>

      <PackList packs={packs} isLoading={isLoading} />

      {error ? (
        <Pressable onPress={clearError} style={s.errorBox}>
          <Text style={s.errorText}>{error}</Text>
          <Text style={s.errorHint}>Tap to dismiss</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  buyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  buyText: { color: '#fff', fontWeight: '900' },

  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { color: '#991B1B', fontWeight: '900' },
  errorHint: { color: '#991B1B', marginTop: 4, fontSize: 12 },
});
