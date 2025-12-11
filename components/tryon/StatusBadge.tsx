import React from 'react';
import { View, Text } from 'react-native';
import { TaskStatus } from '@/types/task';

const MAP: Record<TaskStatus, { bg: string; color: string; text: string }> = {
  [TaskStatus.queued]: { bg: '#E5E7EB', color: '#374151', text: 'In queue' },
  [TaskStatus.running]: {
    bg: '#DBEAFE',
    color: '#1E3A8A',
    text: 'Work in progress',
  },
  [TaskStatus.completed]: { bg: '#DCFCE7', color: '#166534', text: 'Ready' },
  [TaskStatus.failed]: { bg: '#FEE2E2', color: '#991B1B', text: 'Error' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const s = MAP[status];

  return (
    <View
      style={{
        backgroundColor: s.bg,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: s.color, fontWeight: '700', fontSize: 12 }}>
        {s.text}
      </Text>
    </View>
  );
}
