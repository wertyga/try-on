import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TTryOnPreset, useTryOnPresetsStore } from '@/stores';
import { useCreditsStore } from '@/stores/creditStore';

import { PresetsList } from './PresetsList';

type TTaskPresetsSectionProps = {
  image: string;
  taskId?: string;
  title?: string;
};

export const TaskPresetsSection = ({
  image,
  taskId,
  title,
}: TTaskPresetsSectionProps) => {
  const { t } = useTranslation();

  const credits = useCreditsStore();
  const creatingPresetId = useTryOnPresetsStore((s) => s.creatingPresetId);
  const createTaskWithPreset = useTryOnPresetsStore(
    (s) => s.createTaskWithPreset,
  );

  const handlePresetSelect = (preset: TTryOnPreset) => {
    Alert.alert(t('presets.confirmTitle'), t('presets.confirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: async () => {
          await credits.load();

          if (!useCreditsStore.getState().canGenerate(true)) return;

          try {
            const task = await createTaskWithPreset({
              presetId: preset._id,
              image,
              presetImage: preset.image,
              taskId,
            });

            if (task) {
              router.push(`/(tabs)/task/${task._id}`);
            }
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
    <PresetsList
      title={title}
      disabledPresetId={creatingPresetId}
      onSelectPreset={handlePresetSelect}
    />
  );
};
