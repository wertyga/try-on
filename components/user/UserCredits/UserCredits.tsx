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
  const resetsAt = useCreditsStore((s) => s.resetsAt);
  const freeDailyLeft = useCreditsStore((s) => s.freeDailyLeft);
  const guestFreeLeft = useCreditsStore((s) => s.guestFreeLeft);
  const availablePaidCredits = useCreditsStore((s) =>
    s.getAvailablePaidCredits(),
  );
  const reservedCredits = useCreditsStore(
    (s) => s.reservedTaskIds.length + s.pendingReservationIds.length,
  );

  return (
    <View style={s.card}>
      <UserBalance
        resetsAt={resetsAt}
        credits={availablePaidCredits}
        reservedCredits={showReservedCredits ? reservedCredits : 0}
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
