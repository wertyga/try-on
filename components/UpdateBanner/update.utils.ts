import * as Updates from 'expo-updates';
import { AppState, AppStateStatus, Platform, Alert } from 'react-native';
import SpInAppUpdates, { IAUUpdateKind } from 'sp-react-native-in-app-updates';
import { useTryOnStore } from '@/stores';
import { useTestStore } from '@/stores/useTestStore';

const inAppUpdates = new SpInAppUpdates(true);

export async function checkStoreUpdate(opts?: { immediate?: boolean }) {
  try {
    const result = await inAppUpdates.checkNeedsUpdate();
    useTestStore.getState().setMessage({ result });
    if (!result?.shouldUpdate) return false;

    if (Platform.OS === 'android') {
      await inAppUpdates.startUpdate({
        updateType: opts?.immediate
          ? IAUUpdateKind.IMMEDIATE
          : IAUUpdateKind.FLEXIBLE,
      });
    } else {
      // iOS — редирект в App Store
      await inAppUpdates.startUpdate({});
    }

    return true; // 🚫 дальше OTA делать нельзя
  } catch (e: any) {
    useTestStore.getState().setMessage({ '[store-updates] error': e.message });
    console.log('[store-updates] error', e);
    return false;
  }
}

export async function checkAndApplyUpdate(
  opts: { onReady?: (restart: () => void) => void } = {},
) {
  try {
    // 0️⃣ СНАЧАЛА — Store update
    const startedStoreUpdate = await checkStoreUpdate({
      immediate: false, // поменяешь на true если нужен force-update
    });
    useTestStore.getState().setMessage({ startedStoreUpdate });
    if (startedStoreUpdate) {
      return; // ⛔ НЕ идём в OTA
    }

    // 1️⃣ ПОТОМ — OTA
    if (!Updates.isEnabled) return;

    const result = await Updates.checkForUpdateAsync();
    useTestStore
      .getState()
      .setMessage({ 'Updates.checkForUpdateAsync.result': result });
    if (!result.isAvailable) return;

    await Updates.fetchUpdateAsync();
    opts.onReady?.(() => Updates.reloadAsync());
  } catch (e) {
    console.log('[updates] error', e);
  }
}

/** Проверка при старте и при возврате в active */
export function watchUpdates(
  opts: { onReady?: (restart: () => void) => void } = {},
) {
  // 🔹 при старте
  checkAndApplyUpdate(opts).catch(() => {});

  // 🔹 при возврате в app
  const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
    useTestStore.getState().setMessage({ state });
    if (state === 'active') {
      checkAndApplyUpdate(opts).catch(() => {});
    }
  });

  return () => sub.remove();
}
