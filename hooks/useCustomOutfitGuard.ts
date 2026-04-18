import React from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';

import { fetchHasSucceededPayment } from '@/stores/creditStore';
import { useModalsStore, useUserStore } from '@/stores';
import { useFocus } from './useFocus';
import { isIOS } from '@/stores/appStore';

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
      if (!isIOS) {
        router.replace({
          pathname: '/signin',
        });

        return false;
      }

      // openPaywall({
      //   titleKey: 'paywall.customOutfit.title',
      //   subtitleKey: 'paywall.customOutfit.subtitle',
      // });
      //
      // return false;
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
