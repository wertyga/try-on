import { TryOnPayload } from '@/stores/useTryOnStore';
import { baseQuery } from './base';
import { Categories } from '@/types';
import { TTask } from '@/types/task';
import { TTryOnPreset, TTryOnSample } from '@/stores';

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

type TCreateTaskBySamplePayload = {
  sampleId: string;
  mode: TryOnPayload['mode'];
  userBase64: string;
};

export async function createTaskBySample(
  data: TCreateTaskBySamplePayload,
): Promise<{
  task: TTask;
  imagesCategories: Categories[];
}> {
  const { data: create } = await baseQuery({
    method: 'post',
    url: '/tryon/samples',
    data,
  });

  return {
    task: create.task,
    imagesCategories: create.imagesCategories,
  };
}

export async function createTaskByPreset(data: {
  presetId: string;
  imageBase64: string;
  taskId?: string;
}): Promise<{
  task: TTask;
}> {
  const { data: create } = await baseQuery({
    method: 'post',
    url: '/tryon-preset',
    data,
  });

  return {
    task: create.task,
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

export async function getTaskList(): Promise<TTask[]> {
  const { data: tasks } = await baseQuery({
    method: 'get',
    url: `/task`,
  });

  return tasks;
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

export async function fetchTryOnSamples(): Promise<TTryOnSample[]> {
  const {
    data: { samples },
  } = await baseQuery<{ samples: TTryOnSample[] }>({
    method: 'get',
    url: '/tryon/samples/list',
    silentError: true,
  });

  return samples ?? [];
}

export async function fetchTryOnPresets(): Promise<TTryOnPreset[]> {
  const {
    data: { presets },
  } = await baseQuery<{ presets: TTryOnPreset[] }>({
    method: 'get',
    url: '/tryon-preset/list',
    silentError: true,
  });

  return presets ?? [];
}
