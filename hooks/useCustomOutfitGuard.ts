import React from 'react';
import { router } from 'expo-router';

import { fetchHasSucceededPayment } from '@/stores/creditStore';
import { useModalsStore, useUserStore } from '@/stores';
import { useFocus } from './useFocus';

type TUseCustomOutfitGuardOptions = {
  useOnFocus?: boolean;
};

export const useCustomOutfitGuard = ({
  useOnFocus,
}: TUseCustomOutfitGuardOptions = {}) => {
  const isCheckingAccessRef = React.useRef(false);

  const [isCheckingAccess, setIsCheckingAccess] = React.useState(false);

  const user = useUserStore((s) => s.user);
  const openPaywall = useModalsStore((s) => s.openPaywall);

  const checkCustomOutfitAccess = React.useCallback(async () => {
    if (!user) {
      router.replace({
        pathname: '/login',
        params: { redirectTo: '/custom-outfit' },
      });

      return false;
    }

    if (isCheckingAccessRef.current) {
      return false;
    }

    try {
      isCheckingAccessRef.current = true;
      setIsCheckingAccess(true);

      const succeededPayment = await fetchHasSucceededPayment();

      if (!succeededPayment) {
        openPaywall({
          titleKey: 'paywall.customOutfit.title',
          subtitleKey: 'paywall.customOutfit.subtitle',
        });

        return false;
      }

      return true;
    } finally {
      isCheckingAccessRef.current = false;
      setIsCheckingAccess(false);
    }
  }, [openPaywall, user]);

  useFocus(() => {
    if (!useOnFocus) {
      return;
    }

    checkCustomOutfitAccess();
  }, [checkCustomOutfitAccess, useOnFocus]);

  return {
    isCheckingAccess,
    checkCustomOutfitAccess,
  };
};
