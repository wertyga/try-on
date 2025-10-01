import { TryOnPayload } from '@/hooks/useTryOnStore';
import { baseQuery } from '@/api/base-query';

export async function createTask(data: TryOnPayload): Promise<{
  id: string;
  assets: {
    model: string;
    dress: string;
    upper: string;
    lower: string;
  };
}> {
  const { data: create } = await baseQuery({
    method: 'post',
    url: '/tryon',
    data,
  });

  const id: string | undefined =
    create?.task?.data?.task_id ?? create?.data?.task_id;

  if (!id) throw new Error('task_id не получен');

  return {
    id,
    assets: create.assets,
  };
}

export async function getTask(taskId: string): Promise<{
  status: string;
  image: string;
  id: string;
  error: {
    code: number;
    raw_message: string;
    message: string;
    detail: string | null;
  };
}> {
  const { data: task } = await baseQuery({
    method: 'get',
    url: `/tryon/${taskId}`,
  });

  return task;
}
