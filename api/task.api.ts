import { TryOnPayload } from '@/stores/useTryOnStore';
import { baseQuery } from './base';
import { Categories } from '@/types';
import { TTask } from '@/types/task';

export async function createTask(data: TryOnPayload): Promise<{
  task: TTask;
  imagesCategories: Categories[];
}> {
  const { data: create } = await baseQuery({
    method: 'post',
    url: '/tryon',
    data,
  });

  return {
    task: create.task,
    imagesCategories: create.imagesCategories,
  };
}

export const retryTaskCreate = async (data: TryOnPayload, taskId: string) => {
  const { data: create } = await baseQuery({
    method: 'post',
    url: '/tryon',
    data: {
      ...data,
      taskId,
    },
  });

  return {
    task: create.task,
  };
};

export async function getTask(taskId: string): Promise<TTask> {
  const { data: task } = await baseQuery({
    method: 'get',
    url: `/tryon/${taskId}`,
  });

  return task;
}

export const getFinishedTask = async (
  taskId: string,
  abortSignal?: AbortSignal,
): Promise<TTask> => {
  const { data: task } = await baseQuery({
    method: 'get',
    url: `/tryon/${taskId}/finished`,
    signal: abortSignal,
  });

  return task;
};

export const removeTask = async (taskId: string) => {
  await baseQuery({
    method: 'delete',
    url: `/tryon/${taskId}`,
  });
};
