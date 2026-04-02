import { AppState, AppStateStatus } from 'react-native';
import {
  checkAndApplyUpdate,
  CheckAndApplyUpdateResult,
  dismissBinaryUpdate,
  WatchUpdatesOpts,
} from './update.utils';
import { useEffect, useState } from 'react';
import { UpdateBannerMode } from './UpdateBanner';

export type TUseWatchUpdateReturn = Pick<
  CheckAndApplyUpdateResult,
  'isCritical' | 'recommendedBuild'
> & {
  hasChecked: boolean;
  updateMode: UpdateBannerMode;
  onDismiss: () => void;
};

export const useWatchUpdate = (): TUseWatchUpdateReturn => {
  const [state, setState] = useState<
    CheckAndApplyUpdateResult & {
      hasChecked: boolean;
    }
  >({ isCritical: false, isUpdateAvailable: false, hasChecked: false });

  function watchUpdates(opts: WatchUpdatesOpts = {}) {
    const run = async () => {
      const { isCritical, isUpdateAvailable, recommendedBuild } =
        await checkAndApplyUpdate(opts);

      setState({
        isCritical,
        isUpdateAvailable,
        hasChecked: true,
        recommendedBuild,
      });
    };

    run();

    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        run();
      } else {
        setState({
          isCritical: false,
          isUpdateAvailable: false,
          hasChecked: false,
        });
      }
    });

    return () => sub.remove();
  }

  useEffect(() => {
    watchUpdates();
  }, []);

  return {
    updateMode: state.isCritical
      ? 'critical'
      : state.recommendedBuild
        ? 'binary'
        : 'none',
    isCritical: state.isCritical,
    recommendedBuild: state.recommendedBuild,
    hasChecked: state.hasChecked,
    onDismiss: () => dismissBinaryUpdate(state.recommendedBuild ?? 0),
  };
};
