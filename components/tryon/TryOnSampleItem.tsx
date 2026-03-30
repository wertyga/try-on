import React, { FC } from 'react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { TTryOnSample } from '@/stores';

type TTryOnSampleItemProps = {
  item: TTryOnSample;
  isSelected?: boolean;
  onPress: (sample: TTryOnSample) => void;
};

export const TryOnSampleItem: FC<TTryOnSampleItemProps> = ({
  item,
  isSelected = false,
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
    width: 168,
    borderRadius: 24,
    padding: 4,
    paddingBottom: 0,
    backgroundColor: '#F5F7FC',
    borderWidth: 1,
    borderColor: '#DBE1EE',
    overflow: 'hidden',
  },
  itemSelected: {
    borderColor: '#2F73EB',
    borderWidth: 3,
  },
  image: {
    width: '100%',
    height: 226,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  itemTitle: {
    color: '#3B4E77',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 9,
    textAlign: 'center',
  },
  itemTitleSelected: {
    backgroundColor: '#1F64DE',
    color: '#fff',
  },
});
