import React, { FC } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TTryOnSample } from '@/stores';

type TTryOnSampleItemProps = {
  item: TTryOnSample;
  onPress: (sample: TTryOnSample) => void;
};

export const TryOnSampleItem: FC<TTryOnSampleItemProps> = ({
  item,
  onPress,
}) => {
  return (
    <Pressable
      style={[s.item]}
      onPress={() => onPress(item)}
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
