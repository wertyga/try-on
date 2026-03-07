import { useMemo } from 'react';
import { TTryOnSample } from '@/api/task.api';
import { useCreditsStore } from '@/stores/creditStore';
import { useProductsStore, useTryOnStore, useUserStore } from '@/stores';
import { fingerprintFromPayload } from '@/utils/hash';
import { buildTryOnPayload, hasPendingTryOnTask } from './GenerateTaskButton.utils';
import { trackTaskCreateEvent } from '@/analytics';

export function useGenerateTaskData(
  selectedSample?: TTryOnSample | null,
  selfUpload = false,
) {
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
  const credits = useCreditsStore();

  const hasPendingTask = useMemo(() => hasPendingTryOnTask(tasks), [tasks]);

  const { payload, fingerPrint } = useMemo(() => {
    const payload = buildTryOnPayload({
      selfUpload,
      selectedSample,
      userPhoto,
      mode,
      dress,
      upper,
      lower,
      glasses,
      hairstyle,
      accessories,
    });

    return {
      payload,
      fingerPrint: payload ? fingerprintFromPayload(payload) : undefined,
    };
  }, [
    selectedSample,
    selfUpload,
    userPhoto,
    mode,
    dress,
    upper,
    lower,
    glasses,
    hairstyle,
    accessories,
  ]);

  const trackTaskCreating = () => {
    trackTaskCreateEvent({
      upper: payload?.upperBase64,
      mode: payload?.mode,
      dress: payload?.dressBase64,
      lower: payload?.lowerBase64,
      fp: fingerPrint,
      user: payload?.userBase64,
    });
  };

  return {
    addTask,
    fetchCategoriesForImages,
    user,
    credits,
    payload,
    fingerPrint,
    hasPendingTask,
    trackTaskCreating,
  };
}
