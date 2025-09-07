import * as Updates from 'expo-updates';
import { AppState, AppStateStatus, Platform } from 'react-native';

export async function checkAndApplyUpdate(
  opts: { prompt?: (restart: () => void) => void } = {},
) {
  try {
    // В Expo Go и в dev-режиме OTA нет
    if (__DEV__ || !Updates.isEnabled || Platform.OS === 'web') return;

    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    // Скачиваем
    await Updates.fetchUpdateAsync();

    // Если передали prompt — даём пользователю решить когда перезапускать
    if (opts.prompt) {
      opts.prompt(() => Updates.reloadAsync());
    } else {
      // Иначе перезапускаем сразу (мгновенное применение)
      await Updates.reloadAsync();
    }
  } catch (e) {
    // По желанию: залогируйте/покажите тост
    console.log('[updates] error', e);
  }
}

/** Запускает авто-проверку при старте и при возврате из бэкграунда */
export function watchUpdates(
  opts: { prompt?: (restart: () => void) => void } = {},
) {
  // Стартовая проверка
  checkAndApplyUpdate(opts).catch(() => {});

  // Проверка при возвращении на передний план
  const sub = AppState.addEventListener('change', (s: AppStateStatus) => {
    if (s === 'active') checkAndApplyUpdate(opts).catch(() => {});
  });
  return () => sub.remove();
}
