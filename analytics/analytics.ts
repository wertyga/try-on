import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

type EventName =
  | 'sample_clicked'
  | 'task_created'
  | 'generation_completed'
  | 'studio_preset_clicked'
  | 'auth_modal_opened'
  | 'signup_completed'
  | 'signup_bonus_granted'
  | 'credit_spent'
  | 'paywall_opened'
  | 'save_to_wardrobe'
  | 'custom_upload_opened'
  | 'custom_generation_started';

type EventParams = Record<string, string | number | boolean | null | undefined>;

const analytics = () => getAnalytics(getApp());

const sanitize = (params?: EventParams) => {
  if (!params) return undefined;

  const out: Record<string, string | number | boolean | null> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;

    out[key.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24)] =
      typeof value === 'string' ? value.slice(0, 100) : value;
  });

  return out;
};

export const Analytics = {
  event: async (name: EventName, params?: EventParams) => {
    await logEvent(analytics(), name, sanitize(params));
  },
};
