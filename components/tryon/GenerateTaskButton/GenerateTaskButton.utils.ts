import {
  GarmentMode,
  GarmentImage,
  TryOnPayload,
  TryOnTask,
  UserPhoto,
} from '@/stores/useTryOnStore';
import { TaskStatus } from '@/types/task';
import { TTryOnSample } from '@/stores';

type TBuildPayloadArgs = {
  selfUpload?: boolean;
  selectedSample?: TTryOnSample | null;
  userPhoto: UserPhoto;
  mode: GarmentMode;
  dress: GarmentImage;
  upper: GarmentImage;
  lower: GarmentImage;
  glasses: GarmentImage;
  hairstyle: GarmentImage;
  accessories: GarmentImage;
};

export function buildTryOnPayload({
  selfUpload = false,
  selectedSample,
  userPhoto,
  mode,
  dress,
  upper,
  lower,
  glasses,
  hairstyle,
  accessories,
}: TBuildPayloadArgs): TryOnPayload | null {
  if (!userPhoto?.base64) return null;

  if (!selfUpload) {
    if (!selectedSample?._id) return null;

    return {
      sampleId: selectedSample._id,
      mode,
      userBase64: userPhoto.base64,
    };
  }

  const hasManualGarment =
    dress || upper || lower || glasses || hairstyle || accessories;
  if (!hasManualGarment) return null;

  return {
    mode,
    userBase64: userPhoto.base64,
    ...(mode === 'dress'
      ? { dressBase64: dress?.base64 }
      : { upperBase64: upper?.base64, lowerBase64: lower?.base64 }),
    glassesBase64: glasses?.base64,
    hairstyleBase64: hairstyle?.base64,
    accessoriesBase64: accessories?.base64,
  };
}

export function hasPendingTryOnTask(tasks: TryOnTask[]) {
  return tasks.some(
    (t) => t.status === TaskStatus.running || t.status === TaskStatus.queued,
  );
}

export function getGenerateButtonDisabled({
  payload,
  creating,
  hasPendingTask,
}: {
  payload: TryOnPayload | null;
  creating: boolean;
  hasPendingTask: boolean;
}) {
  return !payload || creating || hasPendingTask || !payload.userBase64;
}
