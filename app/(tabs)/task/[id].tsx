import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

import {
  TaskPresetsSection,
  TaskSamplesSection,
  TaskItem,
} from '@/components/tryon';
import { Container } from '@/components/ui/Container';
import { TryOnTask, useTryOnStore } from '@/stores/useTryOnStore';
import { TaskStatus } from '@/types/task';
import { useTranslation } from 'react-i18next';
import { StatusBox } from '@/components/ui/StatusBox';

export default function TaskDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [taskLoading, setTaskLoading] = useState('');

  const { removeTask, fetchFinishedTask, retryTask } = useTryOnStore();
  const task = useTryOnStore((s) => s.getTask(id));
  const tasksLength = useTryOnStore((s) => s.tasks.length);

  useEffect(() => {
    if (!task?.id) return;

    if (
      task.status === TaskStatus.running ||
      task.status === TaskStatus.queued
    ) {
      fetchFinishedTask(task.id);
    }
  }, [fetchFinishedTask, task?.id, task?.status]);

  const handleRemoveTask = async (taskId: string) => {
    setTaskLoading(taskId);

    try {
      await removeTask(taskId);

      router.replace('/task');
    } catch (e) {
    } finally {
      setTaskLoading('');
    }
  };

  const handleRetryTask = async (tryOnTask: TryOnTask) => {
    try {
      await retryTask(tryOnTask);
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.message || t('task.retryFailed', 'Retry failed'),
      );
    }
  };

  const isPresetMode = task?.mode === 'preset';

  const isTaskCompleted =
    task?.status === TaskStatus.completed && !!task.resultImageUrl;
  const hasSampleSource = !!task?.sample;
  const hasPresetSource = !!task?.preset || isPresetMode;
  const isRenderPresets =
    isTaskCompleted &&
    (hasSampleSource || (!hasSampleSource && !hasPresetSource));
  const isRenderSamples =
    isTaskCompleted &&
    (hasPresetSource || (!hasSampleSource && !hasPresetSource));

  const isShowFirstTaskGenerated = isTaskCompleted && tasksLength === 1;

  return (
    <Container.WithTabBar title={t('queue.title')}>
      {isShowFirstTaskGenerated && (
        <StatusBox
          variant="info"
          title={t('task.firstLookReadyTitle')}
          message={t('task.firstLookReadyText')}
        />
      )}

      {!!task && (
        <>
          <TaskItem
            task={task}
            isLoading={taskLoading === task.id}
            onRetry={handleRetryTask}
            onRemove={handleRemoveTask}
            onSaveSuccess={() => router.replace('/wardrobe')}
          />

          {isRenderPresets && (
            <TaskPresetsSection image={task.resultImageUrl!} />
          )}

          {isRenderSamples && (
            <TaskSamplesSection image={task.resultImageUrl!} />
          )}
        </>
      )}
    </Container.WithTabBar>
  );
}
