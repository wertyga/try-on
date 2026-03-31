import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import {
  TTryOnPreset,
  useTryOnPresetsStore,
} from '@/stores/useTryOnPresetsStore';
import { useFocus } from '@/hooks';
import { PresetItem } from './PresetItem';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '@/stores';

type TPresetsListProps = {
  selectedPresetId?: string;
  disabledPresetId?: string;
  title?: string;
  onSelectPreset: (preset: TTryOnPreset) => void;
};

export const PresetsList = ({
  selectedPresetId,
  disabledPresetId,
  onSelectPreset,
  title,
}: TPresetsListProps) => {
  const { t } = useTranslation();
  const { presets, isLoading, fetchPresets } = useTryOnPresetsStore();
  const user = useUserStore((s) => s.user);

  useFocus(() => {
    if (!isLoading) {
      fetchPresets();
    }
  }, []);

  if (!presets.length) {
    return null;
  }

  const newTitle =
    title ?? (user ? t('presets.title') : t('presets.unAuthTitle'));

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{newTitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.list}
      >
        {presets.map((item) => {
          return (
            <PresetItem
              key={item._id}
              item={item}
              disabled={disabledPresetId === item._id}
              onPress={onSelectPreset}
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
  },
  cardTitle: {
    marginLeft: 16,
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 0,
  },
  list: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
  },
});
