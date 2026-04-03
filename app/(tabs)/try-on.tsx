import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { ReccomendationProducts } from '@/components/ReccomendationProducts';
import { TaskPresetsSection } from '@/components/tryon';
import { useCreditsStore } from '@/stores/creditStore';
import { TryOnSamplesList } from '@/components/tryon/TryOnSamplesList';
import { TTryOnSample } from '@/stores/useTryOnSamplesStore';
import { UserPhotoUploader } from '@/components/tryon/UserPhotoUploader';
import { useFocus } from '@/hooks';
import { useTryOnStore, useUserStore } from '@/stores';
import { createTaskBySample } from '@/api';
import { getTryOnTaskFromTask } from '@/utils';
import { hash } from '@/utils/hash';
import {
  trackCreditSpent,
  trackSampleClicked,
  trackTaskCreated,
} from '@/analytics';

export default function TryOn() {
  const credits = useCreditsStore();
  const user = useUserStore((s) => s.user);
  const userPhoto = useTryOnStore((s) => s.userPhoto);
  const hasPendingTask = useTryOnStore((s) => s.hasPendingTask());
  const addTask = useTryOnStore((s) => s.addTask);
  const [selectedSample, setSelectedSample] = useState<TTryOnSample | null>(
    null,
  );
  const { t } = useTranslation();
  const pendingTaskTitle = 'Task in queue';
  const pendingTaskSubtitle =
    'Wait until the current task is finished before choosing another sample or preset.';

  useFocus(() => {
    credits.load();
  }, []);

  const handleSampleSelect = (sample: TTryOnSample) => {
    if (!userPhoto?.base64) return;

    trackSampleClicked(sample._id);

    Alert.alert(t('samples.confirmTitle'), t('samples.confirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: async () => {
          await credits.load();

          if (!credits.canGenerate(true)) return;

          const reservationId = credits.beginGenerationReservation();

          try {
            setSelectedSample(sample);

            const { task } = await createTaskBySample({
              sampleId: sample._id,
              mode: 'sample',
              userBase64: userPhoto.base64,
            });

            const fingerprint = `${sample._id}|${hash(userPhoto.base64)}`;
            const nextTask = getTryOnTaskFromTask(task, fingerprint, false);
            nextTask.usesPaidCreditReservation = !!reservationId;

            await credits.onGenerationStarted(reservationId, task._id);

            addTask(nextTask);
            trackTaskCreated('sample', task._id);
            trackCreditSpent('sample', task._id);

            router.push(`/task/${task._id}`);
          } catch (e: any) {
            credits.releaseGenerationReservation(reservationId);
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
        // disabled={hasPendingTask}
        // isLoading={hasPendingTask}
        loadingTitle={pendingTaskTitle}
        loadingSubtitle={pendingTaskSubtitle}
        onSelectSample={handleSampleSelect}
      />

      {!!user && !!userPhoto?.base64 && (
        <TaskPresetsSection
          image={userPhoto.base64}
          title={t('presets.sectionTitle')}
          loadingTitle={pendingTaskTitle}
          loadingSubtitle={pendingTaskSubtitle}
        />
      )}

      <ReccomendationProducts />
    </Container.WithTabBar>
  );
}
