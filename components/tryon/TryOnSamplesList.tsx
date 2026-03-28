import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
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
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    paddingTop: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
  },
  list: {
    gap: 12,
    paddingHorizontal: 12,
    paddingRight: 20,
    paddingBottom: 12,
    paddingTop: 12,
  },
});
