import React, { FC, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomModal } from '@/components/ui/BottomModal';
import { Colors } from '@/constants/Colors';
import { PaywallContent } from './PaywallContent';
import { useCreditsStore } from '@/stores/creditStore';
import { useTranslation } from 'react-i18next';

type PaywallModalProps = {
  visible: boolean;
  onClose: () => void;
  titleKey?: string;
  subtitleKey?: string;
};

export const PaywallModal: FC<PaywallModalProps> = ({
  visible,
  onClose,
  titleKey = 'paywall.default.title',
  subtitleKey = 'paywall.default.subtitle',
}) => {
  const { t } = useTranslation();
  const load = useCreditsStore((s) => s.load);
  const fetchPacks = useCreditsStore((s) => s.fetchPacks);
  const isLoading = useCreditsStore((s) => s.isLoading);
  const isBuyingPack = useCreditsStore((s) => s.isBuyingPack);

  useEffect(() => {
    if (!visible) return;

    load();
    fetchPacks();
  }, [visible, load, fetchPacks]);

  return (
    <BottomModal
      visible={visible}
      onClose={onClose}
      isLoading={isLoading || isBuyingPack}
    >
      <View style={s.header}>
        <View style={s.headerCopy}>
          <Text style={s.title}>{t(titleKey)}</Text>
          <Text style={s.subtitle}>{t(subtitleKey)}</Text>
        </View>
      </View>

      <View
        style={s.scroll}
        // contentContainerStyle={s.content}
        // showsVerticalScrollIndicator={false}
      >
        <PaywallContent />
      </View>
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
    paddingBottom: 80,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },
});
