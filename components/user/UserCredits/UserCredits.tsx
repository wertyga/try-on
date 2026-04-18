import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { UserBalance } from '@/components/billing/UserBalance';
import { useCreditsStore } from '@/stores/creditStore';

type UserCreditsProps = {
  showReservedCredits?: boolean;
};

export const UserCredits: FC<UserCreditsProps> = ({
  showReservedCredits = true,
}) => {
  const guestFreeLeft = useCreditsStore((s) => s.guestFreeLeft);
  const availableCredits = useCreditsStore((s) => s.getAvailableCredits());
  const reservedCredits = useCreditsStore(
    (s) => s.reservedTaskIds.length + s.pendingReservationIds.length,
  );

  return (
    <View style={s.card}>
      <UserBalance
        availableCredits={availableCredits}
        reservedCredits={showReservedCredits ? reservedCredits : 0}
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
