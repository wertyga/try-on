import React from 'react';
import { View } from 'react-native';
import { PaymentCode, useCreditsStore } from '@/stores/creditStore';
import { PackList } from '@/components/Pack';
import { UserCredits } from '@/components/user/UserCredits/UserCredits';
import { StatusBox } from '@/components/ui/StatusBox';

export function PaywallContent() {
  const { isLoading, error, clearError, packs } = useCreditsStore();

  const isDeclinedError = error?.code === PaymentCode.Canceled;

  return (
    <View style={{ gap: 12 }}>
      {/* Balance */}
      <UserCredits />

      {isDeclinedError && (
        <StatusBox
          message={error?.message}
          variant="error"
          hint="Tap to dismiss"
          onPress={clearError}
        />
      )}

      <PackList packs={packs} isLoading={isLoading} />
    </View>
  );
}

export default PaywallContent;
