import React, { FC } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/Colors';
import { TTryOnSample } from '@/api/task.api';

type TTryOnSampleItemProps = {
  item: TTryOnSample;
  isSelected: boolean;
  onPress: (sample: TTryOnSample) => void;
};

export const TryOnSampleItem: FC<TTryOnSampleItemProps> = ({
  item,
  isSelected,
  onPress,
}) => {
  return (
    <Pressable
      style={[s.item, isSelected && s.itemSelected]}
      onPress={() => onPress(item)}
      hitSlop={8}
      pressRetentionOffset={20}
    >
      <Image source={{ uri: item.image }} style={s.image} resizeMode="cover" />
      <Text style={[s.itemTitle, isSelected && s.itemTitleSelected]}>
        {item.title}
      </Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  item: {
    width: 132,
    borderRadius: 14,
    padding: 4,
    paddingBottom: 12,
  },
  itemSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: 172,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  itemTitle: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 10,
    paddingHorizontal: 2,
  },
  itemTitleSelected: {
    color: '#111827',
    fontWeight: '700',
  },
});
