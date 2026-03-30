import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { TryOnTask, useTryOnStore } from '@/stores/useTryOnStore';
import SaveLooksGateComponent from '@/components/SaveLooksGate';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { TaskStatus } from '@/types/task';

type FilterKey = 'all' | 'inProgress' | 'completed';

export default function TryOnQueueScreen() {
  const { t } = useTranslation();

  const [taskLoading, setTaskLoading] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('inProgress');

  const {
    tasks,
    retryTask: retryTaskInStore,
    removeTask,
    clearFinished,
    fetchFinishedTask,
  } = useTryOnStore();

  const fetchUnCompletedTasks = useCallback(() => {
    tasks
      .filter(
        (task) =>
          task.status === TaskStatus.running || task.status === TaskStatus.queued,
      )
      .forEach((task) => {
        fetchFinishedTask(task.id);
      });
  }, [fetchFinishedTask, tasks]);

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
    } finally {
      setTaskLoading('');
    }
  };

  useEffect(() => {
    fetchUnCompletedTasks();
  }, [fetchUnCompletedTasks]);

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [tasks],
  );

  const counters = useMemo(() => {
    const inProgress = sortedTasks.filter(
      (task) =>
        task.status === TaskStatus.running || task.status === TaskStatus.queued,
    ).length;

    return {
      all: sortedTasks.length,
      inProgress,
      completed: sortedTasks.filter((task) => task.status === TaskStatus.completed)
        .length,
    };
  }, [sortedTasks]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'inProgress') {
      return sortedTasks.filter(
        (task) =>
          task.status === TaskStatus.running || task.status === TaskStatus.queued,
      );
    }

    if (activeFilter === 'completed') {
      return sortedTasks.filter((task) => task.status === TaskStatus.completed);
    }

    return sortedTasks;
  }, [activeFilter, sortedTasks]);

  const filterTabs = [
    { key: 'all' as const, label: 'All Tasks', count: counters.all },
    {
      key: 'inProgress' as const,
      label: 'In Progress',
      count: counters.inProgress,
    },
    { key: 'completed' as const, label: 'Completed', count: counters.completed },
  ];

  return (
    <Container.WithTabBar title="">
      <View style={s.topRow}>
        <Pressable style={s.iconButton}>
          <Ionicons name="menu" size={28} color="#2F335A" />
        </Pressable>

        <View style={s.notificationWrap}>
          <Pressable style={s.iconButton}>
            <Ionicons name="notifications" size={24} color="#2F335A" />
          </Pressable>
          <View style={s.badge}>
            <Text style={s.badgeText}>{Math.min(counters.inProgress, 9)}</Text>
          </View>
        </View>
      </View>

      <Text style={s.title}>Task List</Text>
      <Text style={s.subtitle}>Manage your styling tasks</Text>

      <SaveLooksGateComponent style={{ marginBottom: 14 }} />

      <View style={s.filters}>
        {filterTabs.map((tab) => {
          const active = tab.key === activeFilter;

          return (
            <Pressable
              key={tab.key}
              style={[s.filterBtn, active && s.filterBtnActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[s.filterText, active && s.filterTextActive]}>
                {tab.label}
              </Text>
              {tab.key !== 'all' && (
                <View style={[s.countPill, active && s.countPillActive]}>
                  <Text style={s.countText}>{tab.count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {!!counters.completed && (
        <Pressable style={s.clearButton} onPress={clearFinished}>
          <Ionicons name="trash-outline" size={16} color="#5B5FCC" />
          <Text style={s.clearText}>{t('queue.clearFinished')}</Text>
        </Pressable>
      )}

      {!filteredTasks.length && (
        <View style={s.empty}>
          <Text style={s.emptyText}>{t('queue.empty')}</Text>
        </View>
      )}

      {filteredTasks.map((task) => {
        const isInProcess =
          task.status === TaskStatus.running || task.status === TaskStatus.queued;
        const isCompleted = task.status === TaskStatus.completed;
        const isFailed = task.status === TaskStatus.failed;

        const title =
          task.preset?.title || task.sample?.title || 'Custom outfit generation';

        const subtitle = isFailed
          ? task.error || 'Task failed. Try again to continue.'
          : task.message ||
            (isInProcess
              ? 'Generating your styled look...'
              : 'Your generated look is ready');

        const dateLabel = new Date(task.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        return (
          <View key={task.id} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardIcon}>{getTaskEmoji(task)}</Text>
              <View style={s.cardTitleWrap}>
                <Text style={s.cardTitle}>{title}</Text>
                <Text style={s.cardSubtitle}>{subtitle}</Text>
              </View>

              <View
                style={[
                  s.statusPill,
                  isCompleted && s.statusCompleted,
                  isFailed && s.statusFailed,
                ]}
              >
                <Text style={s.statusPillText}>
                  {isCompleted
                    ? 'Completed'
                    : isFailed
                      ? 'Failed'
                      : 'In Progress'}
                </Text>
              </View>
            </View>

            {isInProcess && (
              <View style={s.progressArea}>
                <View style={s.progressTrack}>
                  <View
                    style={[
                      s.progressValue,
                      {
                        width:
                          task.status === TaskStatus.running
                            ? '66%'
                            : task.status === TaskStatus.queued
                              ? '34%'
                              : '0%',
                      },
                    ]}
                  />
                </View>
                <Text style={s.metaText}>Started: {dateLabel}</Text>
              </View>
            )}

            {!isInProcess && (
              <View style={s.actionsRow}>
                {isCompleted ? (
                  <Pressable
                    style={s.secondaryAction}
                    onPress={() => router.push(`/(tabs)/task/${task.id}`)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#4B4FB6" />
                    <Text style={s.secondaryActionText}>Open</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={s.secondaryAction}
                    onPress={() => handleRetryTask(task)}
                    disabled={taskLoading === task.id}
                  >
                    <Ionicons name="refresh" size={16} color="#4B4FB6" />
                    <Text style={s.secondaryActionText}>Retry</Text>
                  </Pressable>
                )}

                <Pressable
                  style={s.deleteAction}
                  onPress={() => handleRemoveTask(task.id)}
                  disabled={taskLoading === task.id}
                >
                  <MaterialIcons name="delete-outline" size={18} color="#7A7FA6" />
                </Pressable>
              </View>
            )}
          </View>
        );
      })}

      <Text style={s.sectionTitle}>Upcoming Appointments</Text>
      <View style={s.appointmentCard}>
        <View style={s.avatarCircle}>
          <Ionicons name="person" size={20} color="#6A6E95" />
        </View>

        <View style={s.appointmentBody}>
          <Text style={s.appointmentTitle}>Style Session with Olivia</Text>
          <View style={s.calendarRow}>
            <Ionicons name="calendar-outline" size={16} color="#7A7FA6" />
            <Text style={s.appointmentTime}>May 18, 14:00 - 15:00</Text>
          </View>
        </View>

        <Ionicons name="calendar" size={22} color="#B0B3D4" />
      </View>

      <Pressable style={s.addButton} onPress={() => router.push('/(tabs)/try-on')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
        <Text style={s.addButtonText}>Add New Task</Text>
      </Pressable>
    </Container.WithTabBar>
  );
}

function getTaskEmoji(task: TryOnTask) {
  if (task.status === TaskStatus.completed) {
    return '✅';
  }

  if (task.mode === 'dress') {
    return '👗';
  }

  if (task.mode === 'preset') {
    return '🧳';
  }

  if (task.mode === 'sample') {
    return '✨';
  }

  return '👕';
}

const s = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: '#F2545B',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  title: {
    fontSize: 24,
    color: '#252A4A',
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
    color: '#7A7FA6',
    fontSize: 17,
    fontWeight: '500',
  },
  filters: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#2B3050',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 2,
  },
  filterBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: '#5E45E6',
  },
  filterText: {
    color: '#5A5F8A',
    fontWeight: '700',
    fontSize: 18,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  countPill: {
    minWidth: 27,
    height: 27,
    borderRadius: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECECFF',
  },
  countPillActive: {
    backgroundColor: '#7F6AF0',
  },
  countText: {
    color: '#fff',
    fontWeight: '700',
  },
  clearButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  clearText: {
    color: '#5B5FCC',
    fontWeight: '600',
  },
  empty: {
    marginTop: 28,
    marginBottom: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7A7FA6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEFA',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cardIcon: {
    fontSize: 28,
    lineHeight: 32,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: '#2D3257',
    fontSize: 21,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#7078A2',
    fontSize: 16,
    lineHeight: 21,
  },
  statusPill: {
    backgroundColor: '#5E45E6',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statusCompleted: {
    backgroundColor: '#38B174',
  },
  statusFailed: {
    backgroundColor: '#DC4D68',
  },
  statusPillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  progressArea: {
    marginTop: 14,
    gap: 8,
  },
  progressTrack: {
    width: '100%',
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E3E6F5',
  },
  progressValue: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#5E45E6',
  },
  metaText: {
    color: '#7A7FA6',
    fontSize: 13,
    fontWeight: '500',
  },
  actionsRow: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF0FA',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secondaryActionText: {
    color: '#4B4FB6',
    fontWeight: '700',
  },
  deleteAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 10,
    color: '#7078A2',
    fontSize: 17,
    fontWeight: '700',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECEEFA',
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0F2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentBody: {
    flex: 1,
  },
  appointmentTitle: {
    color: '#2D3257',
    fontSize: 18,
    fontWeight: '700',
  },
  calendarRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentTime: {
    color: '#69709A',
    fontSize: 16,
  },
  addButton: {
    height: 64,
    borderRadius: 32,
    backgroundColor: '#5E45E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
});
