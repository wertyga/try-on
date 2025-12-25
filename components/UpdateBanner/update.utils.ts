import * as Updates from 'expo-updates';
import { AppState, AppStateStatus, Platform } from 'react-native';

export async function checkAndApplyUpdate(
  opts: { onReady?: (restart: () => void) => void } = {},
) {
  try {
    if (__DEV__ || !Updates.isEnabled || Platform.OS === 'web') return;

    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    await Updates.fetchUpdateAsync();

    // Сообщаем, что апдейт готов
    opts.onReady?.(() => Updates.reloadAsync());
  } catch (e) {
    console.log('[updates] error', e);
  }
}

/** Проверка при старте и при возврате в active */
export function watchUpdates(
  opts: { onReady?: (restart: () => void) => void } = {},
) {
  checkAndApplyUpdate(opts).catch(() => {});

  const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
    if (s === 'active') checkAndApplyUpdate(opts).catch(() => {});
  });

  return () => sub.remove();
}
