import React from 'react';
import { View } from 'react-native';
import { useCreditsStore } from '@/stores/creditStore';
import { PackList } from '@/components/Pack';
import { UserCredits } from '@/components/user/UserCredits/UserCredits';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { useFocus } from '@/hooks';

export default function PaywallContent() {
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

      <ErrorBox error={error} clearError={clearError} />
    </View>
  );
}
