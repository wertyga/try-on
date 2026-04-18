import React from 'react';
import {
  TTryOnSample,
  useTryOnSamplesStore,
} from '@/stores/useTryOnSamplesStore';
import { useFocus } from '@/hooks';
import { TryOnSampleItem } from './TryOnSampleItem';
import { ThumbsContainer } from '@/components/ui/ThumbsContainer';

type TTryOnSamplesListProps = {
  selectedSampleId?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingTitle?: string;
  loadingSubtitle?: string;
  onSelectSample: (sample: TTryOnSample) => void;
};

export const TryOnSamplesList = ({
  selectedSampleId,
  disabled = false,
  isLoading = false,
  loadingTitle,
  loadingSubtitle,
  onSelectSample,
}: TTryOnSamplesListProps) => {
  const { samples, fetchSamples } = useTryOnSamplesStore();

  useFocus(() => {
    fetchSamples();
  }, []);

  if (!samples.length) {
    return null;
  }

  return (
    <ThumbsContainer
      title="Popular styles"
      isLoading={isLoading}
      loadingTitle={loadingTitle}
      loadingSubtitle={loadingSubtitle}
    >
      {samples.map((item) => {
        return (
          <TryOnSampleItem
            key={item._id}
            item={item}
            disabled={disabled}
            onPress={onSelectSample}
          />
        );
      })}
    </ThumbsContainer>
  );
};
