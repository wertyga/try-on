import { Analytics } from '@/analytics/analytics';
import { TryOnTask } from '@/hooks/useTryOnStore';

export const trackTaskCreateEvent = ({
  user,
  mode,
  dress,
  upper,
  lower,
  fp,
}: Record<
  'user' | 'mode' | 'dress' | 'upper' | 'lower' | 'fp',
  string | undefined
>) => {
  Analytics.event('tryon_generate_click', {
    has_photo: !!user,
    mode,
    has_dress: !!dress,
    has_upper: !!upper,
    has_lower: !!lower,
  });

  Analytics.event('tryon_task_create_start', {
    fingerprint: fp,
    mode,
  });
};

export const trackTaskSucceededEvent = (id: string, fp: string) => {
  Analytics.event('tryon_task_create_success', {
    task_id: id,
    fingerprint: fp,
  });
};

export const trackRetryTask = (task: TryOnTask) => {
  Analytics.event('task_retry', { task_hint: task.id.slice(-6) });
};
