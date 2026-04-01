import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { TaskItem } from '@/components/tryon';
import { TryOnTask, useTryOnStore } from '@/stores/useTryOnStore';
import SaveLooksGate from '@/components/SaveLooksGate';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { TaskStatus } from '@/types/task';

export default function TryOnQueueScreen() {
  const { t } = useTranslation();

  const [taskLoading, setTaskLoading] = useState('');

  const {
    tasks,
    retryTask: retryTaskInStore,
    removeTask,
    clearFinished,
    fetchFinishedTask,
  } = useTryOnStore();

  const fetchUnCompletedTasks = () => {
    tasks
      .filter(
        (t) =>
          t.status === TaskStatus.running || t.status === TaskStatus.queued,
      )
      .forEach((task) => {
        fetchFinishedTask(task.id);
      });
  };

  async function handleRetryTask(tryOnTask: TryOnTask) {
    try {
      await retryTaskInStore(tryOnTask);
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.message || t('task.retryFailed', 'Retry failed'),
      );
    }
  }

  const handleRemoveTask = async (id: string) => {
    setTaskLoading(id);

    try {
      await removeTask(id);
    } catch (e) {
    } finally {
      setTaskLoading('');
    }
  };

  useEffect(() => {
    fetchUnCompletedTasks();
  }, [tasks]);

  const empty = useMemo(
    () => (
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <Text style={{ color: '#6B7280', textAlign: 'center' }}>
          {t('queue.empty')}
        </Text>
      </View>
    ),
    [t],
  );

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [tasks],
  );

  const completedTask = sortedTasks.find(
    (t) => t.status === TaskStatus.completed,
  );

  return (
    <Container.WithTabBar title={t('queue.title')}>
      <SaveLooksGate style={{ marginBottom: 12 }} />

      {!!completedTask && (
        <View style={s.actions}>
          <Pressable style={s.btnLight} onPress={clearFinished}>
            <Text style={s.btnLightText}>{t('queue.clearFinished')}</Text>
          </Pressable>
        </View>
      )}

      {!sortedTasks.length && empty}

      {sortedTasks.map((item) => (
        <TaskItem
          key={item.id}
          task={item}
          isLoading={taskLoading === item.id}
          onRetry={handleRetryTask}
          onRemove={handleRemoveTask}
          onOpen={
            item.status === TaskStatus.completed
              ? () => router.push(`/task/${item.id}`)
              : undefined
          }
        />
      ))}
    </Container.WithTabBar>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  btn: {
    flexGrow: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnLight: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  btnLightText: { color: '#111827', fontWeight: '700' },
});
