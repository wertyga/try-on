import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TryOnTask, useTryOnStore } from '@/stores/useTryOnStore';
import { useTranslation } from 'react-i18next';
import { TaskStatus } from '@/types/task';

const taskTabs = ['all', 'inProgress', 'completed'] as const;

type TaskTab = (typeof taskTabs)[number];

const statusLabel: Record<TaskStatus, string> = {
  [TaskStatus.completed]: 'Completed',
  [TaskStatus.failed]: 'Failed',
  [TaskStatus.running]: 'In Progress',
  [TaskStatus.queued]: 'Queued',
};

const statusTone: Record<TaskStatus, string> = {
  [TaskStatus.completed]: '#2EBD85',
  [TaskStatus.failed]: '#E35D6A',
  [TaskStatus.running]: '#6E56E8',
  [TaskStatus.queued]: '#7E89B0',
};

export default function TryOnQueueScreen() {
  const { t } = useTranslation();
  const [taskLoading, setTaskLoading] = useState('');
  const [activeTab, setActiveTab] = useState<TaskTab>('inProgress');

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
        (task) =>
          task.status === TaskStatus.running || task.status === TaskStatus.queued,
      )
      .forEach((task) => {
        fetchFinishedTask(task.id);
      });
  };

  useEffect(() => {
    fetchUnCompletedTasks();
  }, [tasks]);

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

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [tasks],
  );

  const tabCounters = useMemo(
    () => ({
      all: sortedTasks.length,
      inProgress: sortedTasks.filter(
        (task) =>
          task.status === TaskStatus.running || task.status === TaskStatus.queued,
      ).length,
      completed: sortedTasks.filter((task) => task.status === TaskStatus.completed)
        .length,
    }),
    [sortedTasks],
  );

  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') {
      return sortedTasks;
    }

    if (activeTab === 'inProgress') {
      return sortedTasks.filter(
        (task) =>
          task.status === TaskStatus.running || task.status === TaskStatus.queued,
      );
    }

    return sortedTasks.filter((task) => task.status === TaskStatus.completed);
  }, [activeTab, sortedTasks]);

  const completedTask = sortedTasks.some((task) => task.status === TaskStatus.completed);

  const renderTaskIcon = (task: TryOnTask) => {
    if (task.status === TaskStatus.completed) {
      return <Text style={s.emoji}>✅</Text>;
    }

    if (task.status === TaskStatus.failed) {
      return <Text style={s.emoji}>⚠️</Text>;
    }

    return <Text style={s.emoji}>✨</Text>;
  };

  return (
    <View style={s.page}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.headerRow}>
          <Pressable style={s.iconBtn}>
            <MaterialCommunityIcons name="menu" size={28} color="#333760" />
          </Pressable>

          <Text style={s.title}>Task List</Text>

          <Pressable style={s.iconBtn}>
            <MaterialCommunityIcons name="bell-outline" size={26} color="#333760" />
            {tabCounters.inProgress > 0 && (
              <View style={s.badgeCounter}>
                <Text style={s.badgeCounterText}>{tabCounters.inProgress}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text style={s.subtitle}>Manage your styling tasks</Text>

        <View style={s.tabsWrap}>
          {taskTabs.map((tab) => {
            const isActive = activeTab === tab;
            const label =
              tab === 'all'
                ? 'All Tasks'
                : tab === 'inProgress'
                  ? 'In Progress'
                  : 'Completed';

            return (
              <Pressable
                key={tab}
                style={[s.tabItem, isActive && s.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                {isActive ? (
                  <View style={s.tabGradient}>
                    <Text style={s.tabTextActive}>
                      {label}
                      {tab === 'inProgress' ? `  ${tabCounters.inProgress}` : ''}
                    </Text>
                  </View>
                ) : (
                  <Text style={s.tabText}>{label}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {completedTask && (
          <Pressable style={s.clearBtn} onPress={clearFinished}>
            <MaterialCommunityIcons name="delete-sweep-outline" size={18} color="#5C43D2" />
            <Text style={s.clearBtnText}>{t('queue.clearFinished')}</Text>
          </Pressable>
        )}

        {!filteredTasks.length && (
          <Text style={s.emptyText}>{t('queue.empty', 'No tasks yet')}</Text>
        )}

        {filteredTasks.map((task, index) => {
          const title = task.preset?.title || task.sample?.title || `Look Task #${index + 1}`;
          const subtitle = task.message || 'Create and review your generated outfit ideas';

          return (
            <Pressable
              key={task.id}
              style={s.card}
              onPress={
                task.status === TaskStatus.completed
                  ? () => router.push(`/(tabs)/task/${task.id}`)
                  : undefined
              }
            >
              <View style={s.cardTop}>
                <View style={s.cardTitleWrap}>
                  {renderTaskIcon(task)}
                  <Text style={s.cardTitle}>{title}</Text>
                </View>

                <View style={[s.statusPill, { backgroundColor: statusTone[task.status] }]}>
                  <Text style={s.statusPillText}>{statusLabel[task.status]}</Text>
                </View>
              </View>

              <Text style={s.cardSubtitle}>{subtitle}</Text>

              <View style={s.cardBottom}>
                <Text style={s.timeLabel}>
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>

                <View style={s.rowActions}>
                  {task.status === TaskStatus.failed && (
                    <Pressable style={s.actionGhost} onPress={() => handleRetryTask(task)}>
                      <Text style={s.actionGhostText}>Retry</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={[s.actionGhost, taskLoading === task.id && s.actionGhostDisabled]}
                    onPress={() => handleRemoveTask(task.id)}
                    disabled={taskLoading === task.id}
                  >
                    <Text style={s.actionGhostText}>
                      {taskLoading === task.id ? 'Removing...' : 'Remove'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={s.addTaskBtn}>
          <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          <Text style={s.addTaskText}>Add New Task</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F0F1F8',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeCounter: {
    position: 'absolute',
    right: 0,
    top: 2,
    minWidth: 22,
    paddingHorizontal: 6,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E85A6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCounterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D315B',
  },
  subtitle: {
    textAlign: 'center',
    color: '#71789D',
    fontSize: 16,
    marginTop: -4,
    marginBottom: 6,
  },
  tabsWrap: {
    backgroundColor: '#FFF',
    borderRadius: 26,
    padding: 5,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7F3',
  },
  tabItem: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tabItemActive: {
    shadowColor: '#5C43D2',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  tabGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#6549DE',
  },
  tabText: {
    textAlign: 'center',
    paddingVertical: 12,
    color: '#747B9D',
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  clearBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  clearBtnText: {
    color: '#5C43D2',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 8,
    color: '#6F7698',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7F1',
    padding: 14,
    shadowColor: '#242858',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  emoji: {
    fontSize: 24,
  },
  cardTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#2B3159',
  },
  statusPill: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  cardSubtitle: {
    color: '#68719A',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ECEFF7',
    paddingTop: 10,
  },
  timeLabel: {
    color: '#5D658D',
    fontWeight: '600',
    fontSize: 14,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionGhost: {
    borderWidth: 1,
    borderColor: '#D4D9EE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFBFF',
  },
  actionGhostDisabled: {
    opacity: 0.6,
  },
  actionGhostText: {
    color: '#4D5684',
    fontWeight: '600',
    fontSize: 13,
  },
  addTaskBtn: {
    backgroundColor: '#6549DE',
    marginTop: 8,
    borderRadius: 28,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#5C43D2',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 12,
    elevation: 5,
  },
  addTaskText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
