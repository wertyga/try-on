import React, { useEffect, useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { TaskItem } from '@/components/tryon';
import { TryOnTask, useTryOnStore } from '@/hooks/useTryOnStore';
import { retryTaskCreate } from '@/api';
import SaveLooksGate from '@/components/SaveLooksGate';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { trackRetryTask } from '@/analytics';
import { TaskStatus } from '@/types/task';
import { getTryOnTaskFromTask } from '@/utils';

export default function TryOnQueueScreen() {
  const { t } = useTranslation();

  const { tasks, updateTask, removeTask, clearFinished, fetchFinishedTask } =
    useTryOnStore();

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

  useEffect(() => {
    fetchUnCompletedTasks();
  }, [tasks]);

  async function retryTask(tryOnTask: TryOnTask) {
    try {
      trackRetryTask(tryOnTask);

      const payload = {
        userBase64: tryOnTask.assets.model,
        dressBase64: tryOnTask.assets.dress,
        mode: tryOnTask.mode,
        upperBase64: tryOnTask.assets.upper,
        lowerBase64: tryOnTask.assets.lower,
      };

      updateTask(tryOnTask.id, {
        status: TaskStatus.queued,
        error: '',
        assets: {
          upper: '',
          dress: '',
          model: '',
          lower: '',
        },
      });

      const { task } = await retryTaskCreate(payload, tryOnTask.id);

      const newTryOnTask = getTryOnTaskFromTask(
        task,
        tryOnTask.fingerprint,
        false,
      );

      updateTask(tryOnTask.id, newTryOnTask);
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.message || t('task.retryFailed', 'Retry failed'),
      );
    }
  }

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

  const hasFinishedTask = !!tasks.find(
    (t) => t.status === TaskStatus.completed,
  );

  return (
    <Container.WithTabBar title={t('queue.title')}>
      <SaveLooksGate style={{ marginBottom: 12 }} />

      {hasFinishedTask && (
        <View style={s.actions}>
          <Pressable style={s.btnLight} onPress={clearFinished}>
            <Text style={s.btnLightText}>{t('queue.clearFinished')}</Text>
          </Pressable>
        </View>
      )}

      {!tasks.length && empty}
      {tasks.map((item) => (
        <TaskItem
          key={item.id}
          task={item}
          onRetry={retryTask}
          onRemove={removeTask}
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
