import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { UserBalance } from '@/components/billing/UserBalance';
import { useCreditsStore } from '@/stores/creditStore';

export const UserCredits: FC = () => {
  const { resetsAt, credits, freeDailyLeft, guestFreeLeft } = useCreditsStore();

  return (
    <View style={s.card}>
      <UserBalance
        resetsAt={resetsAt}
        credits={credits}
        freeDailyLeft={freeDailyLeft}
        guestFreeLeft={guestFreeLeft}
      />
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
});
