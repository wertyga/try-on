import { StyleSheet, Text, View, Pressable } from 'react-native';
import React, { FC } from 'react';
import { useAuthStore, useUserStore } from '@/stores';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useCreditsStore, type TCreditPack } from '@/stores/creditStore';

export const PackListItem: FC<{ pack: TCreditPack }> = ({ pack }) => {
  const { t } = useTranslation();

  const user = useUserStore((s) => s.user);
  const isBuying = useCreditsStore((s) => s.isBuyingPack);
  const { buyPack } = useCreditsStore();
  const { signInWithGoogle } = useAuthStore();

  const onBuy = async () => {
    if (!user) {
      signInWithGoogle();
      return;
    }

    await buyPack(pack.id);
  };

  const isRenderPriceString = !!pack.credits && pack.priceLabel;

  return (
    <View key={pack.id} style={s.packCard}>
      <View style={{ flex: 1 }}>
        <View style={s.packTitleRow}>
          <Text style={s.packTitle}>{pack.title}</Text>
        </View>

        {!!pack.description && (
          <Text style={s.packDesc}>{pack.description}</Text>
        )}

        {isRenderPriceString && (
          <Text style={s.packMeta}>
            {t('pack.generationPrice', {
              credits: pack.credits,
              priceLabel: pack.priceLabel,
            })}
          </Text>
        )}

        {pack.marketFeatures?.filter(Boolean).map(({ name }) => (
          <Text style={s.packDesc} key={name}>{`- ${name}`}</Text>
        ))}
      </View>

      <Pressable
        onPress={onBuy}
        disabled={isBuying}
        style={[s.buyBtn, isBuying && { opacity: 0.6 }]}
      >
        <Text style={s.buyText}>
          {isBuying ? t('common.loading') : t('pack.buy')}
        </Text>
      </Pressable>
    </View>
  );
};

const s = StyleSheet.create({
  packCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.cardBg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 12,
  },
  packTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  packTitle: { fontSize: 15, fontWeight: '900' },
  packDesc: { color: '#6B7280', marginTop: 2 },
  packMeta: { marginTop: 8, fontWeight: '800' },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  buyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  buyText: { color: '#fff', fontWeight: '900' },
});
