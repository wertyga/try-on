import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { ReccomendationProducts } from '@/components/ReccomendationProducts';
import { GenerateTaskButton, TaskPresetsSection } from '@/components/tryon';
import { useCreditsStore } from '@/stores/creditStore';
import { CreditsBadge } from '@/components/CreditsBadge';
import { TryOnSamplesList } from '@/components/tryon/TryOnSamplesList';
import { TTryOnSample } from '@/stores/useTryOnSamplesStore';
import { UserPhotoUploader } from '@/components/tryon/UserPhotoUploader';
import { useFocus } from '@/hooks';
import { useTryOnStore, useUserStore } from '@/stores';
import { createTaskBySample } from '@/api';
import { getTryOnTaskFromTask } from '@/utils';
import { hash } from '@/utils/hash';
import { trackTaskSucceededEvent } from '@/analytics';
import { hasPendingTryOnTask } from '@/components/tryon/GenerateTaskButton/GenerateTaskButton.utils';

export default function TryOn() {
  const credits = useCreditsStore();
  const user = useUserStore((s) => s.user);
  const userPhoto = useTryOnStore((s) => s.userPhoto);
  const tasks = useTryOnStore((s) => s.tasks);
  const addTask = useTryOnStore((s) => s.addTask);
  const [selectedSample, setSelectedSample] = useState<TTryOnSample | null>(
    null,
  );
  const { t } = useTranslation();

  const hasPendingTask = useMemo(() => hasPendingTryOnTask(tasks), [tasks]);

  useFocus(() => {
    credits.load();
  }, []);

  const handleSampleSelect = (sample: TTryOnSample) => {
    if (!userPhoto?.base64 || hasPendingTask) return;

    Alert.alert(t('samples.confirmTitle'), t('samples.confirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: async () => {
          await credits.load();

          if (!credits.canGenerate(true)) return;

          try {
            setSelectedSample(sample);

            const { task } = await createTaskBySample({
              sampleId: sample._id,
              mode: 'sample',
              userBase64: userPhoto.base64,
            });

            const fingerprint = `${sample._id}|${hash(userPhoto.base64)}`;
            addTask(getTryOnTaskFromTask(task, fingerprint, false));
            trackTaskSucceededEvent(task._id, fingerprint);

            await credits.onGenerationSuccess();

            router.push(`/(tabs)/task/${task._id}`);
          } catch (e: any) {
            Alert.alert(
              t('common.error'),
              e?.message || t('errors.failedToCreate'),
            );
          }
        },
      },
    ]);
  };

  return (
    <Container.WithTabBar
      keyboardShouldPersistTaps="handled"
      title={t('home.title')}
    >
      <UserPhotoUploader />

      <TryOnSamplesList
        selectedSampleId={selectedSample?._id}
        onSelectSample={handleSampleSelect}
      />

      {!!user && !!userPhoto?.base64 && (
        <TaskPresetsSection
          image={userPhoto.base64}
          title={t('presets.sectionTitle')}
        />
      )}

      {/*<View style={{ alignItems: 'flex-end', marginBottom: 8 }}>*/}
      {/*  <CreditsBadge />*/}
      {/*</View>*/}

      {/*<GenerateTaskButton selfUpload={false} selectedSample={selectedSample} />*/}

      <ReccomendationProducts />
    </Container.WithTabBar>
  );
}
