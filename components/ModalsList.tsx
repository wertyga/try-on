import { LoginModal } from '@/components/auth';
import { PaywallModal } from '@/components/billing';
import { NewsModal } from '@/components/NewsModal';
import React from 'react';
import { useModalsStore, useNewsStore } from '@/stores';

export const ModalsList = () => {
  const {
    isLoginOpen,
    isPaywallOpen,
    paywallTitleKey,
    paywallSubtitleKey,
    closeLogin,
    closePaywall,
  } = useModalsStore();
  const { latestNews, isNewsModalOpen, closeLatestNews } = useNewsStore();

  return (
    <>
      <NewsModal
        visible={isNewsModalOpen}
        news={latestNews}
        onClose={closeLatestNews}
      />
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
