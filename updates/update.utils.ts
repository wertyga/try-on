import * as Updates from 'expo-updates';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { inAppConfig } from '@/config';
import { storage } from '@/utils';

const DISMISSED_KEY = 'dismissed_binary_update_v'; // + версия recommended, см ниже

// Android package / iOS app id
const ANDROID_PACKAGE = 'com.wertyga.tryon';
const IOS_APP_ID = 'YOUR_APP_ID';

export function openStorePage() {
  if (Platform.OS === 'android') {
    return Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`);
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

function getRecommendedBuild(): number {
  return Platform.OS === 'android'
    ? Number(inAppConfig.RECOMMENDED_ANDROID_VERSION_CODE ?? 0)
    : Number(inAppConfig.RECOMMENDED_IOS_BUILD_NUMBER ?? 0);
}

function getMinBuild(): number {
  return Platform.OS === 'android'
    ? Number(inAppConfig.MIN_ANDROID_VERSION_CODE ?? 0)
    : Number(inAppConfig.MIN_IOS_BUILD_NUMBER ?? 0);
}

export type BinaryUpdateStatus = 'none' | 'binary' | 'critical';
export function getBinaryUpdateStatus(): BinaryUpdateStatus {
  const current = getCurrentBuildNumber();

  const min = getMinBuild();
  const recommended = getRecommendedBuild();

  if (min > 0 && current < min) return 'critical';
  if (recommended > 0 && current < recommended) return 'binary';

  return 'none';
}

async function isBinaryDismissed(): Promise<boolean> {
  // чтобы dismiss сбрасывался при повышении recommended версии
  const v = getRecommendedBuild();
  return !!(await storage.get(`${DISMISSED_KEY}_${v}`));
}

export async function dismissBinaryUpdate() {
  const v = getRecommendedBuild();
  await storage.set(`${DISMISSED_KEY}_${v}`, true);
}

export type WatchUpdatesOpts = {
  onReady?: (restart: () => void) => void; // OTA ready
  onBinary?: (p: { isCritical: boolean }) => void; // binary update banner
};

export async function checkAndApplyUpdate(opts: WatchUpdatesOpts = {}) {
  try {
    if (Platform.OS !== 'web') {
      const current = getCurrentBuildNumber();
      const min = getMinBuild();
      const rec = getRecommendedBuild();

      // 0) critical
      if (min > 0 && current < min) {
        opts.onBinary?.({ isCritical: true });
        return { isCritical: true };
      }

      // 1) recommended (dismissable)
      if (rec > 0 && current < rec) {
        const dismissed = await isBinaryDismissed();
        if (!dismissed) opts.onBinary?.({ isCritical: false });
      }
    }

    // 2) OTA updates
    if (!Updates.isEnabled || Platform.OS === 'web')
      return { isCritical: false };

    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return { isCritical: false };

    await Updates.fetchUpdateAsync();
    opts.onReady?.(() => Updates.reloadAsync());

    return { isCritical: false };
  } catch (e) {
    console.log('[updates] error', e);
    return { isCritical: false };
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
