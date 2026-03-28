import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBadge } from './StatusBadge';
import { TryOnTask } from '@/stores/useTryOnStore';
import { useUserStore } from '@/stores/useUserStore';
import { Button } from '@/components/ui/button';
import { useWardrobeStore } from '@/stores/useWardrobeStore';
import { useTranslation } from 'react-i18next';
import { TaskStatus } from '@/types/task';
import { ImageZoom } from '@/components/ImageZoom';
import { ButtonWithConfirm } from '@/components/ButtonWithConfirm';
import { useErrorMessage } from '@/utils/errors';
import { DownloadImageButton } from '@/components/DownloadImageButton';

export function TaskItem({
  task,
  onRetry,
  onRemove,
  isLoading,
  onOpen,
  isLargeImage = false,
  onSaveSuccess,
}: {
  task: TryOnTask;
  onRetry?: (t: TryOnTask) => void;
  onRemove: (id: string) => void;
  isLoading: boolean;
  onOpen?: () => void;
  isLargeImage?: boolean;
  onSaveSuccess?: () => void;
}) {
  const { user } = useUserStore();
  const { add: saveWardrobe, isSaving: isWardrobeLoading } = useWardrobeStore();

  const { t } = useTranslation();

  const errorMessage = useErrorMessage(task.error);

  const isInProcess =
    task.status === TaskStatus.queued || task.status === TaskStatus.running;
  const isCompleted =
    task.status === TaskStatus.completed && !!task.resultImageUrl;
  const isError = task.status === TaskStatus.failed;

  const areCtasLoading = isWardrobeLoading || isLoading;
  const canDownload = isCompleted && !!task.resultImageUrl;

  const isRenderRetryBtn = !!onRetry && isError;
  const isRenderSaveBtn =
    !!user && !isInProcess && !task.isSaved && isCompleted;
  const isRenderDeleteBtn = !isInProcess;
  const mediaStyle = isLargeImage ? s.resultLarge : s.result;
  const placeholderStyle = isLargeImage ? s.placeholderLarge : s.placeholder;

  const handleSaveWardrobe = async () => {
    await saveWardrobe(task);
    onSaveSuccess?.();
  };

  return (
    <View style={s.item}>
      <View style={s.header}>
        <StatusBadge status={task.status} />

        {!!onOpen && (
          <Pressable style={s.openButton} onPress={onOpen} hitSlop={8}>
            <MaterialIcons name="arrow-forward" size={20} color="#111827" />
          </Pressable>
        )}
      </View>

      <View style={s.mediaWrap}>
        {isCompleted ? (
          <ImageZoom
            source={{ uri: task.resultImageUrl }}
            style={mediaStyle}
            imageStyle={{ objectFit: 'contain' }}
          />
        ) : (
          <View style={placeholderStyle}>
            {isError ? (
              <Text style={{ color: '#991B1B', marginHorizontal: 10 }}>
                {errorMessage}
              </Text>
            ) : (
              <ActivityIndicator />
            )}
          </View>
        )}

        <View style={s.actions}>
          <View style={{ gap: 10 }}>
            {canDownload && (
              <DownloadImageButton
                imageUrl={task.resultImageUrl}
                style={s.overlayButton}
              />
            )}
            {isRenderSaveBtn && (
              <Button
                dark
                onPress={handleSaveWardrobe}
                style={s.overlayButton}
                isLoading={areCtasLoading}
              >
                <MaterialIcons name="bookmark-border" size={24} color="#fff" />
              </Button>
            )}
          </View>

          {isRenderDeleteBtn && (
            <ButtonWithConfirm
              dark
              style={s.overlayButton}
              onPress={() => onRemove(task.id)}
              isLoading={areCtasLoading}
              alertText={t('alerts.cancelTaskTitle')}
            >
              <MaterialIcons name="delete-outline" size={24} color="#fff" />
            </ButtonWithConfirm>
          )}
        </View>
      </View>

      {isRenderRetryBtn && (
        <View style={s.retryRow}>
          <Pressable style={s.btnPrimary} onPress={() => onRetry(task)}>
            <Text style={s.btnPrimaryText}>Try more</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  item: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginVertical: 12,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  title: { fontWeight: '800' },
  mediaWrap: {
    position: 'relative',
    marginTop: 8,
  },
  placeholder: {
    height: 240,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderLarge: {
    height: 420,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: {
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    height: 250,
  },
  resultLarge: {
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    height: 420,
  },
  actions: {
    position: 'absolute',
    top: 0,
    right: 10,
    paddingVertical: 8,
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  retryRow: {
    marginTop: 8,
  },
  meta: { marginTop: 6, color: '#6B7280', fontSize: 12 },
  btnPrimary: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  overlayButton: {
    width: 50,
    height: 50,
    paddingHorizontal: 0,
  },
});
