import { useMemo } from 'react';
import { useCreditsStore } from '@/stores/creditStore';
import {
  TTryOnSample,
  useProductsStore,
  useTryOnStore,
  useUserStore,
} from '@/stores';
import { fingerprintFromPayload } from '@/utils/hash';
import {
  buildTryOnPayload,
  hasPendingTryOnTask,
} from './GenerateTaskButton.utils';

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

  return {
    addTask,
    fetchCategoriesForImages,
    user,
    credits,
    payload,
    fingerPrint,
    hasPendingTask,
  };
}
