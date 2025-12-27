import * as Updates from 'expo-updates';
import { AppState, AppStateStatus, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { inAppConfig } from '@/config';

export function getCurrentBuildNumber(): number {
  if (Platform.OS === 'android') {
    return Number(Constants.expoConfig?.android?.versionCode ?? 0);
  }
  // iOS: buildNumber строка
  const bn = Constants.expoConfig?.ios?.buildNumber ?? '0';
  return Number(bn) || 0;
}

export function isCriticalUpdateRequired(): boolean {
  const current = getCurrentBuildNumber();

  if (Platform.OS === 'android') {
    return current < (inAppConfig.MIN_ANDROID_VERSION_CODE ?? 0);
  }
  return current < (inAppConfig.MIN_IOS_BUILD_NUMBER ?? 0);
}

export function openStorePage() {
  if (Platform.OS === 'android') {
    return Linking.openURL(
      `market://details?id=${inAppConfig.ANDROID_PACKAGE}`,
    );
  }
  return Linking.openURL(
    `itms-apps://apps.apple.com/app/id${inAppConfig.IOS_APP_ID}`,
  );
}

export type WatchUpdatesOpts = {
  onReady?: (restart: () => void) => void;
  onCritical?: () => void;
};

export async function checkAndApplyUpdate(opts: WatchUpdatesOpts = {}) {
  try {
    // 0) критический апдейт: не делаем OTA, просим обновиться в сторе
    if (isCriticalUpdateRequired()) {
      opts.onCritical?.();
      return { isCritical: true };
    }

    // 1) обычные OTA
    if (!Updates.isEnabled || Platform.OS === 'web') {
      return { isCritical: false };
    }

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
  let lastIsCritical = false;

  const run = async () => {
    const res = await checkAndApplyUpdate(opts);
    lastIsCritical = !!res?.isCritical;
  };

  run().catch(() => {});

  const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') run().catch(() => {});
  });

  return () => sub.remove();
}
