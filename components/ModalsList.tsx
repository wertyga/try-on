import { LoginModal } from '@/components/auth';
import { PaywallModal } from '@/components/billing';
import React from 'react';
import { useModalsStore } from '@/stores';

export const ModalsList = () => {
  const {
    isLoginOpen,
    isPaywallOpen,
    paywallTitleKey,
    paywallSubtitleKey,
    closeLogin,
    closePaywall,
  } = useModalsStore();

  return (
    <>
      <LoginModal visible={isLoginOpen} onClose={closeLogin} />
      <PaywallModal
        visible={isPaywallOpen}
        onClose={closePaywall}
        titleKey={paywallTitleKey}
        subtitleKey={paywallSubtitleKey}
      />
    </>
  );
};
