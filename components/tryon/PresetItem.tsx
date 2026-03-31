import React, { FC } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TTryOnPreset } from '@/stores';

type TPresetItemProps = {
  item: TTryOnPreset;
  disabled?: boolean;
  onPress: (preset: TTryOnPreset) => void;
};

export const PresetItem: FC<TPresetItemProps> = ({
  item,
  disabled,
  onPress,
}) => {
  return (
    <Pressable
      style={[s.item, disabled && s.itemDisabled]}
      onPress={() => onPress(item)}
      disabled={disabled}
      hitSlop={8}
      pressRetentionOffset={20}
    >
      <Image source={{ uri: item.image }} style={s.image} resizeMode="cover" />
      <Text style={[s.itemTitle]}>{item.title}</Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  item: {
    width: 114,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  image: {
    width: '100%',
    height: 156,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  itemTitle: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    paddingHorizontal: 4,
  },
});
