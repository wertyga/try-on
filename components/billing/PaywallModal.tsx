import React, { FC, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomModal } from '@/components/ui/BottomModal';
import { Colors } from '@/constants/Colors';
import { PaywallContent } from './PaywallContent';
import { useCreditsStore } from '@/stores/creditStore';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

export const PaywallModal: FC<PaywallModalProps> = ({
  visible,
  onClose,
  title = 'Get more generations',
  subtitle = 'Top up credits to keep creating try-ons without waiting for the daily reset.',
}) => {
  const load = useCreditsStore((s) => s.load);

  useEffect(() => {
    if (!visible) return;

    load();
  }, [visible, load]);

  return (
    <BottomModal visible={visible} onClose={onClose}>
      <View style={s.header}>
        <View style={s.headerCopy}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <PaywallContent />
      </ScrollView>
    </BottomModal>
  );
};

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },
});
