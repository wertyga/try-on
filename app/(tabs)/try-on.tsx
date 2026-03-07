import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { ReccomendationProducts } from '@/components/ReccomendationProducts';
import { GenerateTaskButton } from '@/components/tryon';
import { useCreditsStore } from '@/stores/creditStore';
import { CreditsBadge } from '@/components/CreditsBadge';
import { TryOnSamplesList } from '@/components/tryon/TryOnSamplesList';
import { TTryOnSample } from '@/api/task.api';
import { UserPhotoUploader } from '@/components/tryon/UserPhotoUploader';

export default function TryOn() {
  const credits = useCreditsStore();
  const [selectedSample, setSelectedSample] = useState<TTryOnSample | null>(
    null,
  );
  const { t } = useTranslation();

  useEffect(() => {
    credits.load();
  }, []);

  return (
    <Container.WithTabBar
      keyboardShouldPersistTaps="handled"
      title={t('home.title')}
    >
      <UserPhotoUploader />

      <TryOnSamplesList
        selectedSampleId={selectedSample?._id}
        onSelectSample={setSelectedSample}
      />

      <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
        <CreditsBadge />
      </View>

      <GenerateTaskButton selfUpload={false} selectedSample={selectedSample} />

      <ReccomendationProducts />
    </Container.WithTabBar>
  );
}
