import React, { useEffect } from 'react';

import { Container } from '@/components/ui/Container';
import { useCustomOutfitGuard } from '@/hooks';
import { TryOnListUploader } from '@/components/tryon/TryOnListUploader';
import { GenerateTaskButton, UserPhotoUploader } from '@/components/tryon';
import { trackCustomUploadOpened } from '@/analytics';

export default function CustomOutfitScreen() {
  const { isCheckingAccess } = useCustomOutfitGuard({
    useOnFocus: true,
  });

  useEffect(() => {
    trackCustomUploadOpened();
  }, []);

  return (
    <Container.WithTabBar title="Custom outfit" isLoading={isCheckingAccess}>
      <UserPhotoUploader />
      <TryOnListUploader />

      <GenerateTaskButton selfUpload />
    </Container.WithTabBar>
  );
}
