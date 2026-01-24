import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useCreditsStore } from '@/stores/creditStore';
import { Colors } from '@/constants/Colors';
import { PackList } from '@/components/Pack';
import { UserBalance } from '@/components/billing/UserBalance';
import { ErrorBox } from '@/components/ui/ErrorBox';

export default function PaywallContent() {
  const {
    packs,
    freeDailyLeft,
    credits,
    resetsAt,
    isLoading,
    error,
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

      <ErrorBox error={error} clearError={clearError} />
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
});
