import { Analytics } from './analytics';

export const trackSampleClicked = (sampleId: string) =>
  Analytics.event('sample_clicked', { sample_id: sampleId });

export const trackTaskCreated = (source: string, taskId: string) =>
  Analytics.event('task_created', {
    source,
    task_id: taskId,
  });

export const trackGenerationCompleted = (taskId: string) =>
  Analytics.event('generation_completed', { task_id: taskId });

export const trackStudioPresetClicked = (presetId: string) =>
  Analytics.event('studio_preset_clicked', { preset_id: presetId });

export const trackAuthModalOpened = () =>
  Analytics.event('auth_modal_opened');

export const trackSignupCompleted = () =>
  Analytics.event('signup_completed');

export const trackSignupBonusGranted = () =>
  Analytics.event('signup_bonus_granted');

export const trackCreditSpent = (source: string, taskId: string) =>
  Analytics.event('credit_spent', {
    source,
    task_id: taskId,
  });

export const trackPaywallOpened = (source: string) =>
  Analytics.event('paywall_opened', { source });

export const trackSaveToWardrobe = (taskId: string) =>
  Analytics.event('save_to_wardrobe', { task_id: taskId });

export const trackCustomUploadOpened = () =>
  Analytics.event('custom_upload_opened');

export const trackCustomGenerationStarted = () =>
  Analytics.event('custom_generation_started');
