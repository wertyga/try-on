import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperty,
} from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

type EventParams = Record<string, string | number | boolean | null | undefined>;

// имена событий — короткие, snake_case, ≤40 символов
export type EventName =
  | 'app_open'
  | 'screen_view'
  | 'consent_toggle'
  | 'photo_pick_start'
  | 'photo_pick_success'
  | 'photo_pick_error'
  | 'photo_clear'
  | 'garment_mode_set'
  | 'garment_pick'
  | 'garment_clear'
  | 'tryon_generate_tap'
  | 'task_created'
  | 'task_status'
  | 'task_completed'
  | 'task_failed'
  | 'task_retry'
  | 'queue_clear_finished'
  | 'save_gate_shown'
  | 'save_gate_cta'
  | 'save_gate_dismiss'
  | 'wardrobe_open'
  | 'wardrobe_item_open'
  | 'wardrobe_item_share'
  | 'wardrobe_item_delete'
  | 'wardrobe_item_save'
  | 'login_google_start'
  | 'login_google_success'
  | 'login_google_error'
  | 'logout'
  | 'policy_open'
  | 'permission_prompt'
  | 'permission_result'
  | 'error_alert';

const a = () => getAnalytics(getApp());

const sanitize = (params?: EventParams) => {
  if (!params) return undefined;
  const out: Record<string, any> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined) return;
    const key = k.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24); // ограничения Firebase
    out[key] = typeof v === 'string' ? v.slice(0, 100) : v;
  });
  return out;
};

export const Analytics = {
  event: async (name: string, params?: Record<string, any>) => {
    await logEvent(a(), name, sanitize(params));
  },
  userId: async (id: string | null) => {
    await setUserId(a(), id ?? '');
  },
  userProp: async (name: string, value: string) => {
    await setUserProperty(a(), name, value);
  },
  screen: async (name: string, klass?: string) => {
    await logEvent(a(), 'screen_view', {
      firebase_screen: name,
      firebase_screen_class: klass ?? name,
    });
  },
};
