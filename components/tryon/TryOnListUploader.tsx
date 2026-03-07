import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CardWithImage } from '@/components/CardWithImage';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { useTryOnStore } from '@/stores';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export const TryOnListUploader = () => {
  const { t } = useTranslation();

  const { mode, dress, upper, lower, glasses, hairstyle, accessories } =
    useTryOnStore();

  function goGarnet() {
    router.push('/(tabs)/garment');
  }

  const notSelectedText = t('common.notSelected');

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Try-on items</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.itemsRow}
      >
        <Pressable style={s.itemCard} onPress={goGarnet}>
          <CardWithImage
            title={t('home.garment')}
            chipMode={mode === 'dress' ? 'dark' : 'light'}
            chipTitle={
              mode === 'dress'
                ? t('garnet.modeDress')
                : t('garnet.modeSeparate')
            }
            uris={mode === 'dress' ? [dress?.uri] : [upper?.uri, lower?.uri]}
            uriTitles={
              mode === 'dress' ? [] : [t('wardrobe.top'), t('wardrobe.bottom')]
            }
            notSelectedText={notSelectedText}
          />
        </Pressable>

        <Pressable style={s.itemCard} onPress={goGarnet}>
          <CardWithImage
            title={'Glasses'}
            uris={[glasses?.uri]}
            notSelectedText={notSelectedText}
          />
        </Pressable>

        <Pressable style={s.itemCard} onPress={goGarnet}>
          <CardWithImage
            title={'Hairstyle'}
            uris={[hairstyle?.uri]}
            notSelectedText={notSelectedText}
          />
        </Pressable>

        <Pressable style={s.itemCard} onPress={goGarnet}>
          <CardWithImage
            title={'Accessories'}
            uris={[accessories?.uri]}
            notSelectedText={notSelectedText}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderColor: Colors.light.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  itemsRow: { gap: 12, paddingRight: 6 },
  itemCard: {
    width: 260,
  },
});
