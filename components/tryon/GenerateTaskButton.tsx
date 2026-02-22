import React, { FC, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import {
  TryOnPayload,
  useAuthStore,
  useProductsStore,
  useTryOnStore,
  useUserStore,
} from '@/stores';
import { trackTaskCreateEvent, trackTaskSucceededEvent } from '@/analytics';
import { createTask } from '@/api';
import { getTryOnTaskFromTask } from '@/utils';
import { fingerprintFromPayload } from '@/utils/hash';

import { useCreditsStore } from '@/stores/creditStore';
import { TaskStatus } from '@/types/task';
import { LoginIcon } from '@/app/(tabs)/_layout';

export const GenerateTaskButton: FC = () => {
  const {
    addTask,
    tasks,
    userPhoto,
    mode,
    dress,
    upper,
    lower,
    glasses,
    hairstyle,
    accessories,
  } = useTryOnStore();
  const { fetchCategoriesForImages } = useProductsStore();

  const { user } = useUserStore();
  const { isLoading: isAuthLoading, signInWithGoogle } = useAuthStore();

  const credits = useCreditsStore();
  const [creating, setCreating] = useState(false);

  const { t } = useTranslation();

  const hasPendingTask = !!tasks.find(
    (t) => t.status === TaskStatus.running || t.status === TaskStatus.queued,
  );

  const payload = useMemo<TryOnPayload | null>(() => {
    if (!userPhoto?.base64) return null;

    const hasAnyGarment =
      dress || upper || lower || glasses || hairstyle || accessories;

    if (!hasAnyGarment) return null;

    return {
      mode,
      userBase64: userPhoto.base64,
      ...(mode === 'dress'
        ? { dressBase64: dress?.base64 }
        : { upperBase64: upper?.base64, lowerBase64: lower?.base64 }),
      ...{
        glassesBase64: glasses?.base64,
        hairstyleBase64: hairstyle?.base64,
        accessoriesBase64: accessories?.base64,
      },
    };
  }, [userPhoto, mode, dress, upper, lower, glasses, hairstyle, accessories]);

  const currentFp = payload ? fingerprintFromPayload(payload) : null;

  async function tryCreateTask() {
    if (creating || !payload || !currentFp) return;

    if (!user) {
      await signInWithGoogle();
      return;
    }

    // 1) Обновим billing state перед проверкой (чтобы не было "устаревших" значений)
    await credits.load();

    // 2) Быстрая UX-проверка на фронте
    if (!credits.canGenerate()) {
      router.push('/paywall');
      return;
    }

    setCreating(true);

    try {
      trackTaskCreateEvent({
        upper: payload.upperBase64,
        mode: payload.mode,
        dress: payload.dressBase64,
        lower: payload.lowerBase64,
        fp: currentFp,
        user: payload.userBase64,
      });

      const { task } = await createTask(payload);

      fetchCategoriesForImages({
        upperBase64: payload.upperBase64,
        dressBase64: payload.dressBase64,
        lowerBase64: payload.lowerBase64,
      });

      addTask(getTryOnTaskFromTask(task, currentFp, false));

      trackTaskSucceededEvent(task._id, currentFp);

      // 3) После успеха — обновляем billing state (бек должен списать free/credits)
      await credits.onGenerationSuccess();

      router.push('/(tabs)/tasks-list');
    } catch (e: any) {
      const error = e.response?.data?.error || e;

      Alert.alert(
        t('common.error') || 'Error',
        error?.message || 'Failed to create task',
      );
    } finally {
      setCreating(false);
    }
  }

  const ctaLabel = useMemo(() => {
    if (!credits.canGenerate()) {
      return t('credits.labels.getMoreGenerations');
    }

    if (!user) {
      return (
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <LoginIcon color="white" isLoading={isAuthLoading} />
          <Text style={s.primaryBtnText}>{t('auth.signIn')}</Text>
        </View>
      );
    }

    return creating ? t('queue.creating') : t('home.generate');
  }, [creating, user, isAuthLoading]);

  const isDisabled = !payload || creating || hasPendingTask;

  return (
    <Pressable
      style={[s.primaryBtn, isDisabled && s.btnDisabled]}
      onPress={tryCreateTask}
      disabled={isDisabled}
    >
      <Text style={s.primaryBtnText}>{ctaLabel}</Text>
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
