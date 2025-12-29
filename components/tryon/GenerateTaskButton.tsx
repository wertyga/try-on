import React, { FC, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { TryOnPayload, useTryOnStore, useUserStore } from '@/stores';
import { trackTaskCreateEvent, trackTaskSucceededEvent } from '@/analytics';
import { createTask } from '@/api';
import { getTryOnTaskFromTask } from '@/utils';
import { fingerprintFromPayload } from '@/utils/hash';

import { useCreditsStore } from '@/stores/creditStore';
import { TaskStatus } from '@/types/task';

export type TGenerateTaskButtonProps = {
  currentPayload: TryOnPayload | null;
};

export const GenerateTaskButton: FC<TGenerateTaskButtonProps> = ({
  currentPayload,
}) => {
  const { addTask, tasks } = useTryOnStore();
  const { updateUserCategories } = useUserStore();

  const credits = useCreditsStore();
  const [creating, setCreating] = useState(false);

  const { t } = useTranslation();

  const hasPendingTask = !!tasks.find(
    (t) => t.status === TaskStatus.running || t.status === TaskStatus.queued,
  );

  async function tryCreateTask(payload: TryOnPayload, fp: string) {
    if (creating) return;

    // 1) Обновим billing state перед проверкой (чтобы не было "устаревших" значений)
    await credits.load();

    // 2) Быстрая UX-проверка на фронте
    if (!credits.canGenerate()) {
      router.push('/paywall');
      return;
    }

    setCreating(true);

    try {
      trackTaskCreateEvent({
        upper: payload.upperBase64,
        mode: payload.mode,
        dress: payload.dressBase64,
        lower: payload.lowerBase64,
        fp,
        user: payload.userBase64,
      });

      const { task, imagesCategories } = await createTask(payload);

      updateUserCategories(imagesCategories);
      addTask(getTryOnTaskFromTask(task, fp, false));

      trackTaskSucceededEvent(task._id, fp);

      // 3) После успеха — обновляем billing state (бек должен списать free/credits)
      await credits.onGenerationSuccess();

      router.push('/(tabs)/tasks-list');
    } catch (e: any) {
      const error = e.response?.data?.error || e;

      Alert.alert(
        t('common.error') || 'Error',
        error?.message || 'Failed to create task',
      );
    } finally {
      setCreating(false);
    }
  }

  const ctaLabel = useMemo(() => {
    if (!credits.canGenerate()) {
      return t('credits.labels.getMoreGenerations');
    }

    return creating ? t('queue.creating') : t('home.generate');
  }, [creating]);

  const currentFp = currentPayload
    ? fingerprintFromPayload(currentPayload)
    : null;

  const isDisabled = !currentPayload || creating || hasPendingTask;

  return (
    <Pressable
      style={[s.primaryBtn, isDisabled && s.btnDisabled]}
      onPress={() =>
        currentPayload && currentFp && tryCreateTask(currentPayload, currentFp)
      }
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
