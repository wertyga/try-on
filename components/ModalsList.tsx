import { LoginModal } from '@/components/auth';
import { PaywallModal } from '@/components/billing';
import React from 'react';
import { useModalsStore } from '@/stores';

export const ModalsList = () => {
  const { isLoginOpen, isPaywallOpen, closeLogin, closePaywall } =
    useModalsStore();

  return (
    <>
      <LoginModal visible={isLoginOpen} onClose={closeLogin} />
      <PaywallModal visible={isPaywallOpen} onClose={closePaywall} />
    </>
  );
};
