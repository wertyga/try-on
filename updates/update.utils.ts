import * as Updates from 'expo-updates';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import type { MutableRefObject } from 'react';

import type { UpdateBannerMode } from './UpdateBanner';

import { storage } from '@/utils';
import { fetchSettings } from '@/api/settings.api';
import { TSettings } from '@/types';
import { sendLogs } from '@/api';

const SETTINGS_CACHE_KEY = 'app_settings_cache_v1';

// dismiss привязываем к recommended версии, чтобы при новой рекомендованной версии баннер снова показался
const DISMISSED_KEY_PREFIX = 'dismissed_binary_update_v_';

// Android package / iOS app id
const ANDROID_PACKAGE = 'com.wertyga.tryon';
const IOS_APP_ID = 'com.wertyga.tryon';

export function openStorePage() {
  if (Platform.OS === 'android') {
    return Linking.openURL(
      `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`,
    );
  }
  return Linking.openURL(`itms-apps://apps.apple.com/app/id${IOS_APP_ID}`);
}

export function getCurrentBuildNumber(): number {
  if (Platform.OS === 'android') {
    return Number(Constants.expoConfig?.android?.versionCode ?? 0);
  }
  const bn = Constants.expoConfig?.ios?.buildNumber ?? '0';
  return Number(bn) || 0;
}

/** Берём настройки: сначала пробуем сеть, если не получилось — берём кеш */
async function getSettings(): Promise<TSettings | null> {
  try {
    const s = await fetchSettings();
    await storage.set(SETTINGS_CACHE_KEY, s);
    return s;
  } catch {
    return (await storage.get(SETTINGS_CACHE_KEY)) as TSettings | null;
  }
}

function getMinBuild(settings: TSettings | null): number {
  if (!settings) return 0;

  return Platform.OS === 'android'
    ? Number(settings.minAndroidVersion ?? 0)
    : Number(settings.minIosVersion ?? 0);
}

function getRecommendedBuild(settings: TSettings | null): number {
  if (!settings) return 0;

  return Platform.OS === 'android'
    ? Number(settings.recommendedAndroidVersion ?? 0)
    : Number(settings.recommendedIosVersion ?? 0);
}

export type BinaryUpdateStatus = 'none' | 'binary' | 'critical';

export function getBinaryUpdateStatusFromSettings(
  settings: TSettings | null,
): BinaryUpdateStatus {
  const current = getCurrentBuildNumber();
  const min = getMinBuild(settings);
  const rec = getRecommendedBuild(settings);

  if (min > 0 && current < min) return 'critical';
  if (rec > 0 && current < rec) return 'binary';

  return 'none';
}

/** Для удобства, если где-то нужно синхронно понять статус по кешу */
export async function getBinaryUpdateStatus(): Promise<BinaryUpdateStatus> {
  const settings = (await storage.get(SETTINGS_CACHE_KEY)) as TSettings | null;

  return getBinaryUpdateStatusFromSettings(settings);
}

async function isBinaryDismissed(recommendedBuild: number): Promise<boolean> {
  if (!recommendedBuild) return false;
  return !!(await storage.get(`${DISMISSED_KEY_PREFIX}${recommendedBuild}`));
}

export async function dismissBinaryUpdate(recommendedBuild: number) {
  if (!recommendedBuild) return;
  await storage.set(`${DISMISSED_KEY_PREFIX}${recommendedBuild}`, true);
}

export function createBinaryUpdateHandler(
  recommendedBuildRef: MutableRefObject<number>,
  setUpdateMode: (mode: UpdateBannerMode) => void,
) {
  return ({
    isCritical,
    recommendedBuild,
  }: {
    isCritical: boolean;
    recommendedBuild: number;
  }) => {
    recommendedBuildRef.current = recommendedBuild ?? 0;
    setUpdateMode(isCritical ? 'critical' : 'binary');
  };
}

export type WatchUpdatesOpts = {
  onReady?: (restart: () => void) => void; // OTA ready
  onBinary?: (p: { isCritical: boolean; recommendedBuild: number }) => void; // binary update banner
};

export type CheckAndApplyUpdateResult = {
  isCritical: boolean;
  isUpdateAvailable: boolean;
  recommendedBuild?: number;
};

export async function checkAndApplyUpdate(
  opts: WatchUpdatesOpts = {},
): Promise<CheckAndApplyUpdateResult> {
  try {
    if (__DEV__) {
      return { isCritical: false, isUpdateAvailable: false };
    }

    const settings = await getSettings();

    const current = getCurrentBuildNumber();

    const min = getMinBuild(settings);
    const rec = getRecommendedBuild(settings);

    // critical
    if (min > 0 && current < min) {
      opts.onBinary?.({ isCritical: true, recommendedBuild: rec });

      return { isCritical: true, isUpdateAvailable: false };
    }

    // recommended (dismissable)
    if (rec > 0 && current < rec) {
      const dismissed = await isBinaryDismissed(rec);
      if (!dismissed) {
        return {
          isCritical: false,
          recommendedBuild: rec,
          isUpdateAvailable: false,
        };
      } else {
        return { isCritical: false, isUpdateAvailable: false };
      }
    }

    const result = await Updates.checkForUpdateAsync();

    if (!result.isAvailable) {
      return { isCritical: false, isUpdateAvailable: false };
    }

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();

    return { isCritical: false, isUpdateAvailable: true };
  } catch (e: any) {
    e.POINT = '[updates] error';
    sendLogs(e);

    return { isCritical: false, isUpdateAvailable: false };
  }
}

/** Проверка при старте и при возврате в active */
export function watchUpdates(opts: WatchUpdatesOpts = {}) {
  const run = () => checkAndApplyUpdate(opts).catch(() => {});
  run();

  const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') run();
  });

  return () => sub.remove();
}
