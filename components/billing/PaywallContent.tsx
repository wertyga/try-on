import React from 'react';
import { View } from 'react-native';
import { useCreditsStore } from '@/stores/creditStore';
import { PackList } from '@/components/Pack';
import { UserCredits } from '@/components/user/UserCredits/UserCredits';
import { StatusBox } from '@/components/ui/StatusBox';
import { useFocus } from '@/hooks';

export function PaywallContent() {
  const { fetchPacks, isLoading, error, clearError, packs } =
    useCreditsStore();

  useFocus(() => {
    fetchPacks();
  });

  return (
    <View style={{ gap: 12 }}>
      {/* Balance */}
      <UserCredits />

      <PackList packs={packs} isLoading={isLoading} />

      <StatusBox
        message={error}
        variant="error"
        hint="Tap to dismiss"
        onPress={clearError}
      />
    </View>
  );
}

export default PaywallContent;
