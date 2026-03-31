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
    paddingTop: 4,
    marginBottom: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardTitle: {
    marginLeft: 16,
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 0,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 14,
    paddingTop: 10,
  },
});
