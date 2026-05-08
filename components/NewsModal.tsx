import React, { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomModal } from '@/components/ui/BottomModal';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/Colors';
import { TNews } from '@/types';

type NewsModalProps = {
  visible: boolean;
  news: TNews | null;
  onClose: () => void;
};

export const NewsModal: FC<NewsModalProps> = ({ visible, news, onClose }) => {
  if (!news) return null;

  return (
    <BottomModal visible={visible} onClose={onClose}>
      <View style={s.header}>
        <Text style={s.label}>News</Text>
        <Text style={s.title}>{news.title}</Text>
      </View>

      <Text style={s.description}>{news.description}</Text>

      <Button fullWidth dark style={s.button} onPress={onClose}>
        Close
      </Button>
    </BottomModal>
  );
};

const s = StyleSheet.create({
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  description: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  button: {
    marginTop: 24,
    marginBottom: 24,
  },
});
