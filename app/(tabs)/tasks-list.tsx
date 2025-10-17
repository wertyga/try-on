import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import TaskItem from '@/components/tryon/TaskItem';
import { useTryOnStore, TryOnTask } from '@/hooks/useTryOnStore';
import { createTask, getTask } from '@/api';
import SaveLooksGate from '@/components/SaveLooksGate';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@/analytics';

export default function TryOnQueueScreen() {
  const startTaskRef = useRef(0);

  const { t } = useTranslation();

  const { tasks, updateTask, removeTask, clearFinished, resetInputs } =
    useTryOnStore();

  const intervalRef = useRef<any>(null);

  // Auto-poll active tasks
  useFocusEffect(
    useCallback(() => {
      startPolling();
      return stopPolling;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]),
  );

  function startPolling() {
    startTaskRef.current = Date.now();

    stopPolling();
    intervalRef.current = setInterval(() => {
      pollActive().catch(() => {});
    }, 3000);
  }

  function stopPolling() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  async function pollActive() {
    const active = tasks.filter(
      (t) => t.status === 'queued' || t.status === 'running',
    );
    if (active.length === 0) return;

    await Promise.all(
      active.map(async (task) => {
        try {
          const j = await getTask(task.id);
          const status: string = j.status || 'queued';

          Analytics.event('task_status', {
            task_hint: task.id.slice(-6),
            status,
          });

          if (status === 'completed') {
            updateTask(task.id, { status: 'completed', resultUrl: j.image });

            // clear inputs after first success
            resetInputs();

            Analytics.event('task_completed', {
              task_hint: task.id.slice(-6),
              duration_ms: Date.now() - startTaskRef.current,
            });
            return;
          }

          if (status === 'failed' || j.error?.code) {
            const msg = j.error?.message || t('task.resultNotFound');
            updateTask(task.id, { status: 'failed', error: msg });

            Analytics.event('task_failed', {
              task_hint: task.id.slice(-6),
              error_code: msg || 'unknown',
            });

            return;
          }

          updateTask(task.id, {
            status: status === 'running' ? 'running' : 'queued',
          });
        } catch {
          // ignore transient errors
        } finally {
          startTaskRef.current = 0;
        }
      }),
    );
  }

  async function retryTask(task: TryOnTask) {
    try {
      Analytics.event('task_retry', { task_hint: task.id.slice(-6) });

      const { id: newId } = await createTask(task.payload);

      updateTask(task.id, {
        id: newId,
        status: 'queued',
        error: null,
        resultUrl: null,
      });
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

  return (
    <Container.WithTabBar title={t('queue.title')}>
      <SaveLooksGate style={{ marginBottom: 12 }} />

      <View style={s.actions}>
        <Pressable style={s.btnLight} onPress={clearFinished}>
          <Text style={s.btnLightText}>{t('queue.clearFinished')}</Text>
        </Pressable>
      </View>

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
