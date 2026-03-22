import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createTaskBySample } from '@/api';
import { TTryOnSample, useCreditsStore, useTryOnStore } from '@/stores';
import { TryOnSamplesList } from './TryOnSamplesList';
import { getTryOnTaskFromTask } from '@/utils';
import { hash } from '@/utils/hash';
import { trackTaskSucceededEvent } from '@/analytics';

type TTaskSamplesSectionProps = {
  image: string;
};

export const TaskSamplesSection = ({ image }: TTaskSamplesSectionProps) => {
  const { t } = useTranslation();
  const credits = useCreditsStore();
  const addTask = useTryOnStore((s) => s.addTask);

  const handleSampleSelect = (sample: TTryOnSample) => {
    Alert.alert(t('samples.confirmTitle'), t('samples.confirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: async () => {
          await credits.load();

          if (!useCreditsStore.getState().canGenerate(true)) return;

          try {
            const { task } = await createTaskBySample({
              sampleId: sample._id,
              mode: 'sample',
              userBase64: image,
            });

            const fingerprint = `${sample._id}|${hash(image)}`;
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

  return <TryOnSamplesList onSelectSample={handleSampleSelect} />;
};
