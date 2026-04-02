import React, { useEffect } from 'react';

import { Container } from '@/components/ui/Container';
import { useCustomOutfitGuard } from '@/hooks';
import { TryOnListUploader } from '@/components/tryon/TryOnListUploader';
import { GenerateTaskButton, UserPhotoUploader } from '@/components/tryon';
import { trackCustomUploadOpened } from '@/analytics';
import { useTranslation } from 'react-i18next';

export default function CustomOutfitScreen() {
  const { isCheckingAccess } = useCustomOutfitGuard({
    useOnFocus: true,
  });

  const { t } = useTranslation();

  useEffect(() => {
    trackCustomUploadOpened();
  }, []);

  return (
    <Container.WithTabBar title="Custom outfit" isLoading={isCheckingAccess}>
      <UserPhotoUploader title={t('home.yourPhoto')} />
      <TryOnListUploader />

      <GenerateTaskButton selfUpload />
    </Container.WithTabBar>
  );
}
