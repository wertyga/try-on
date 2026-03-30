import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  TTryOnSample,
  useTryOnSamplesStore,
} from '@/stores/useTryOnSamplesStore';
import { useFocus } from '@/hooks';
import { TryOnSampleItem } from './TryOnSampleItem';

type TTryOnSamplesListProps = {
  selectedSampleId?: string;
  onSelectSample: (sample: TTryOnSample) => void;
};

export const TryOnSamplesList = ({
  selectedSampleId,
  onSelectSample,
}: TTryOnSamplesListProps) => {
  const { samples, isLoading, fetchSamples } = useTryOnSamplesStore();

  useFocus(() => {
    if (!isLoading) {
      fetchSamples();
    }
  }, []);

  if (!samples.length) {
    return null;
  }

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Popular styles</Text>
      <View style={s.dividerRow}>
        <View style={s.divider} />
        <Text style={s.sectionTitle}>Select Outfit</Text>
        <View style={s.divider} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.list}
      >
        {samples.map((item) => {
          return (
            <TryOnSampleItem
              key={item._id}
              item={item}
              isSelected={item._id === selectedSampleId}
              onPress={onSelectSample}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingTop: 8,
    marginBottom: 12,
  },
  cardTitle: {
    display: 'none',
  },
  dividerRow: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD2E1',
  },
  sectionTitle: {
    color: '#3B4E77',
    fontSize: 20,
    fontWeight: '800',
  },
  list: {
    gap: 12,
    paddingHorizontal: 8,
    paddingRight: 20,
    paddingBottom: 12,
    paddingTop: 2,
  },
});
