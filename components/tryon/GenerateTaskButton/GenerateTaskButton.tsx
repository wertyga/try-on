import React, { FC, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createTask, createTaskBySample } from '@/api';
import { trackTaskSucceededEvent } from '@/analytics';
import { getTryOnTaskFromTask } from '@/utils';
import { getGenerateButtonDisabled } from './GenerateTaskButton.utils';
import { useGenerateTaskData } from './useGenerateTaskData';
import { TTryOnSample } from '@/stores';

type TGenerateTaskButtonProps = {
  selfUpload?: boolean;
  selectedSample?: TTryOnSample | null;
};

export const GenerateTaskButton: FC<TGenerateTaskButtonProps> = ({
  selfUpload = false,
  selectedSample,
}) => {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);

  const {
    addTask,
    fetchCategoriesForImages,
    trackTaskCreating,
    user,
    credits,
    payload,
    fingerPrint,
    hasPendingTask,
  } = useGenerateTaskData(selectedSample, selfUpload);

  const isDisabled = getGenerateButtonDisabled({
    payload,
    creating,
    hasPendingTask,
  });

  async function tryCreateTask() {
    if (isDisabled || !payload || !fingerPrint) return;

    await credits.load();

    if (!credits.canGenerate(true)) return;

    setCreating(true);

    try {
      trackTaskCreating();

      if (selfUpload) {
        // TODO: Disable for now
        // fetchCategoriesForImages({
        //   upperBase64: payload.upperBase64,
        //   dressBase64: payload.dressBase64,
        //   lowerBase64: payload.lowerBase64,
        // });
      }

      if (!selfUpload && !payload.sampleId) return;

      const { task } = selfUpload
        ? await createTask(payload)
        : await createTaskBySample({
            sampleId: payload.sampleId!,
            mode: 'sample',
            userBase64: payload.userBase64,
          });

      addTask(getTryOnTaskFromTask(task, fingerPrint, false));
      trackTaskSucceededEvent(task._id, fingerPrint);

      await credits.onGenerationSuccess();

      router.push(`/(tabs)/task/${task._id}`);
    } finally {
      setCreating(false);
    }
  }

  const ctaLabel = useMemo(() => {
    if (!credits.canGenerate()) {
      return t('credits.labels.getMoreGenerations');
    }

    return creating ? t('queue.creating') : t('home.generate');
  }, [creating, credits, t, user]);

  return (
    <Pressable
      style={[s.primaryBtn, isDisabled && s.btnDisabled]}
      onPress={tryCreateTask}
      disabled={isDisabled}
    >
      <Text style={s.primaryBtnText}>{ctaLabel}</Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
