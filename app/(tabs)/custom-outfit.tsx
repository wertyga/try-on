import React from 'react';

import { Container } from '@/components/ui/Container';
import { useCustomOutfitGuard } from '@/hooks';
import { TryOnListUploader } from '@/components/tryon/TryOnListUploader';
import { GenerateTaskButton, UserPhotoUploader } from '@/components/tryon';

export default function CustomOutfitScreen() {
  const { isCheckingAccess } = useCustomOutfitGuard({
    useOnFocus: true,
  });

  return (
    <Container.WithTabBar title="Custom outfit" isLoading={isCheckingAccess}>
      <UserPhotoUploader />
      <TryOnListUploader />

      <GenerateTaskButton selfUpload />
    </Container.WithTabBar>
  );
}
