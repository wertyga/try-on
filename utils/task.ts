import { TTask } from '@/types/task';
import { TryOnTask } from '@/stores/useTryOnStore';

export const getTryOnTaskFromTask = (
  task: TTask,
  fp?: string,
  isSaved?: boolean,
): TryOnTask => {
  return {
    ...task,
    id: task._id,
    fingerprint: fp ?? '',
    isSaved: !!isSaved,
    assets: {
      model: task.userImageUrl,
      dress: task.dressImageUrl,
      upper: task.upperImageUrl,
      lower: task.lowerImageUrl,
      outfit: task.outfitImageUrl,
      preset: (task as any).presetImageUrl,
    },
  };
};
