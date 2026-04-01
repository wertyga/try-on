import { customEvent, identifyDevice, vexo } from 'vexo-analytics';

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
const VEXO_API_KEY = process.env.EXPO_PUBLIC_VEXO_API_KEY;
let isInitialized = false;

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

const isEnabled = () => Boolean(VEXO_API_KEY);

export const Analytics = {
  init: () => {
    if (!VEXO_API_KEY || isInitialized) return;

    vexo(VEXO_API_KEY);

    isInitialized = true;
  },
  identify: async (deviceId: string | null) => {
    if (!isEnabled()) return;

    await identifyDevice(deviceId);
  },
  event: async (name: EventName, params?: EventParams) => {
    if (!isEnabled()) return;

    customEvent(name, sanitize(params) ?? {});
  },
};
