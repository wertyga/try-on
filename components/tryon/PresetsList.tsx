import React from 'react';
import {
  TTryOnPreset,
  useTryOnPresetsStore,
} from '@/stores/useTryOnPresetsStore';
import { useFocus } from '@/hooks';
import { PresetItem } from './PresetItem';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/stores';
import { ThumbsContainer } from '@/components/ui/ThumbsContainer';

type TPresetsListProps = {
  selectedPresetId?: string;
  disabledPresetId?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingTitle?: string;
  loadingSubtitle?: string;
  title?: string;
  onSelectPreset: (preset: TTryOnPreset) => void;
};

export const PresetsList = ({
  selectedPresetId,
  disabledPresetId,
  disabled = false,
  isLoading = false,
  loadingTitle,
  loadingSubtitle,
  onSelectPreset,
  title,
}: TPresetsListProps) => {
  const { t } = useTranslation();
  const { presets, fetchPresets } = useTryOnPresetsStore();
  const user = useUserStore((s) => s.user);

  useFocus(() => {
    fetchPresets();
  }, []);

  if (!presets.length) {
    return null;
  }

  const newTitle =
    title ?? (user ? t('presets.title') : t('presets.unAuthTitle'));
  return (
    <ThumbsContainer
      title={newTitle}
      isLoading={isLoading}
      loadingTitle={loadingTitle}
      loadingSubtitle={loadingSubtitle}
    >
      {presets.map((item) => {
        return (
          <PresetItem
            key={item._id}
            item={item}
            disabled={disabled || disabledPresetId === item._id}
            onPress={onSelectPreset}
          />
        );
      })}
    </ThumbsContainer>
  );
};
