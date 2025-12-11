import { TryOnPayload, useTryOnStore } from '@/hooks/useTryOnStore';
import { trackTaskCreateEvent, trackTaskSucceededEvent } from '@/analytics';
import { createTask } from '@/api';
import { getTryOnTaskFromTask } from '@/utils';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import React, { FC, useState } from 'react';
import { useUserStore } from '@/hooks/useUserStore';
import { fingerprintFromPayload } from '@/utils/hash';
import { useTranslation } from 'react-i18next';
import { useUsageStore } from '@/hooks';

export type TGenerateTaskButtonProps = {
  currentPayload: TryOnPayload | null;
};

export const GenerateTaskButton: FC<TGenerateTaskButtonProps> = ({
  currentPayload,
}) => {
  const { addTask } = useTryOnStore();
  const { updateUserCategories } = useUserStore();
  const { isAllowed } = useUsageStore();

  const [creating, setCreating] = useState(false);

  const { t } = useTranslation();

  async function tryCreateTask(payload: TryOnPayload, fp: string) {
    setCreating(true);

    try {
      trackTaskCreateEvent({
        upper: payload.upperBase64,
        mode: payload.mode,
        dress: payload.dressBase64,
        lower: payload.lowerBase64,
        fp,
        user: payload.userBase64,
      });

      const { task, imagesCategories } = await createTask(payload);
      updateUserCategories(imagesCategories);

      addTask(getTryOnTaskFromTask(task, fp, false));

      trackTaskSucceededEvent(task._id, fp);

      router.push('/(tabs)/tasks-list');
    } finally {
      setCreating(false);
    }
  }

  const currentFp = currentPayload
    ? fingerprintFromPayload(currentPayload)
    : null;

  const isDisabled = !currentPayload || !isAllowed || creating;

  return (
    <Pressable
      style={[s.primaryBtn, isDisabled && s.btnDisabled]}
      onPress={() =>
        currentPayload && currentFp && tryCreateTask(currentPayload, currentFp)
      }
      disabled={isDisabled}
    >
      <Text style={s.primaryBtnText}>
        {creating ? t('queue.creating') : t('home.generate')}
      </Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
