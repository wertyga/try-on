import { Image, Pressable, StyleSheet, Text } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';

export type TThumbProps = {
  title: string;
  image: string;
  disabled?: boolean;
  onPress?: () => void;
};

export const Thumb = ({ title, image, disabled, onPress }: TThumbProps) => {
  return (
    <Pressable
      style={[s.item, disabled && s.itemDisabled]}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      pressRetentionOffset={20}
    >
      <Image source={{ uri: image }} style={s.image} resizeMode="cover" />
      <Text style={[s.itemTitle]} numberOfLines={1}>
        {title}
      </Text>
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
