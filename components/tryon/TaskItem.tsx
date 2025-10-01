import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import StatusBadge from './StatusBadge';
import { TryOnTask } from '@/hooks/useTryOnStore';
import { useUserStore } from '@/hooks/useUserStore';
import { Button } from '@/components/ui/button';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';

export default function TaskItem({
  task,
  onRetry,
  onRemove,
}: {
  task: TryOnTask;
  onRetry: (t: TryOnTask) => void;
  onRemove: (id: string) => void;
}) {
  const { user } = useUserStore();
  const { add: saveWardrobe, isLoading: isWardrobeLoading } =
    useWardrobeStore();

  const isInProcess = task.status === 'queued' || task.status === 'running';

  return (
    <View style={s.item}>
      <View style={s.header}>
        <StatusBadge status={task.status} />
      </View>

      {task.status === 'completed' && task.resultUrl ? (
        <Image
          source={{ uri: task.resultUrl }}
          style={s.result}
          resizeMode="contain"
        />
      ) : (
        <View style={s.placeholder}>
          {task.status === 'failed' ? (
            <Text style={{ color: '#991B1B' }}>{task.error || 'Error'}</Text>
          ) : (
            <ActivityIndicator />
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {task.status === 'failed' && (
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
                onPress={() => saveWardrobe(task)}
                style={s.btnPrimary}
                isLoading={isWardrobeLoading}
              >
                {task.isSaved ? 'Saved' : 'Save look'}
              </Button>
            </>
          )}
        {!isInProcess && (
          <Pressable style={s.btnLight} onPress={() => onRemove(task.id)}>
            <Text style={s.btnLightText}>Delete</Text>
          </Pressable>
        )}
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
    height: 360,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#E5E7EB',
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
