import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBadge } from './StatusBadge';
import { TryOnTask, useTryOnStore } from '@/stores/useTryOnStore';
import { useUserStore } from '@/stores/useUserStore';
import { Button } from '@/components/ui/button';
import { useWardrobeStore } from '@/stores/useWardrobeStore';
import { useTranslation } from 'react-i18next';
import { TaskStatus } from '@/types/task';
import { ImageZoom } from '@/components/ImageZoom';
import { ButtonWithConfirm } from '@/components/ButtonWithConfirm';
import { trackTaskErrorEvent } from '@/analytics';
import { useErrorMessage } from '@/utils/errors';

export function TaskItem({
  task,
  onRetry,
  onRemove,
  isLoading,
}: {
  task: TryOnTask;
  onRetry: (t: TryOnTask) => void;
  onRemove: (id: string) => void;
  isLoading: boolean;
}) {
  const { user } = useUserStore();
  const { add: saveWardrobe, isLoading: isWardrobeLoading } =
    useWardrobeStore();
  const { removeTask } = useTryOnStore();

  const { t } = useTranslation();

  const errorMessage = useErrorMessage(task.error);

  useEffect(() => {
    if (!errorMessage) return;

    trackTaskErrorEvent({ ...task, errorMessage });
  }, [errorMessage]);

  const isInProcess =
    task.status === TaskStatus.queued || task.status === TaskStatus.running;
  const isCompleted =
    task.status === TaskStatus.completed && !!task.resultImageUrl;
  const isError = task.status === TaskStatus.failed;

  const areCtasLoading = isWardrobeLoading || isLoading;
  const canDownload = isCompleted && !!task.resultImageUrl;

  return (
    <View style={s.item}>
      <View style={s.header}>
        <StatusBadge status={task.status} />
      </View>

      {isCompleted ? (
        <ImageZoom
          source={{ uri: task.resultImageUrl }}
          style={s.result}
          imageStyle={{ objectFit: 'contain' }}
          withDownload={canDownload}
        />
      ) : (
        <View style={s.placeholder}>
          {isError ? (
            <Text style={{ color: '#991B1B', marginHorizontal: 10 }}>
              {errorMessage}
            </Text>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {isError && (
          <Pressable style={s.btnPrimary} onPress={() => onRetry(task)}>
            <Text style={s.btnPrimaryText}>Try more</Text>
          </Pressable>
        )}
        {!!user &&
          !isInProcess &&
          !task.isSaved &&
          task.status !== 'failed' && (
            <>
              <Button
                dark
                onPress={() => saveWardrobe(task)}
                style={s.btnPrimary}
                isLoading={areCtasLoading}
              >
                {t(
                  task.isSaved ? 'interactions.saved' : 'interactions.saveLook',
                )}
              </Button>
            </>
          )}

        <ButtonWithConfirm
          style={s.btnLight}
          onPress={() => onRemove(task.id)}
          isLoading={areCtasLoading}
          alertText={t('alerts.cancelTaskTitle')}
        >
          {t('common.delete')}
        </ButtonWithConfirm>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  item: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontWeight: '800' },
  placeholder: {
    height: 240,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  result: {
    width: '100%',
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#E5E7EB',
    aspectRatio: 3 / 4,
  },
  meta: { marginTop: 6, color: '#6B7280', fontSize: 12 },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnLight: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnLightText: { color: '#111827', fontWeight: '700' },
});
