import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CardWithImage } from '@/components/CardWithImage';
import React, { useMemo, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { useTryOnStore } from '@/stores';
import { useTranslation } from 'react-i18next';
import { BottomModal } from '@/components/ui/BottomModal';
import { GarmentUploader } from '@/components/tryon/GarmentUploader';

export const TryOnListUploader = () => {
  const { t } = useTranslation();

  const [isGarmentOpened, setIsGarmentOpened] = useState(false);
  const [isGarmentLoading, setIsGarmentLoading] = useState(false);

  const { mode, dress, upper, lower, glasses, hairstyle, accessories } =
    useTryOnStore();

  function goGarnet() {
    setIsGarmentOpened(true);
  }

  const notSelectedText = t('common.notSelected');

  const imagesList = useMemo(() => {
    const commonItems = [
      {
        key: 'glasses',
        title: t('garnet.cardGlasses'),
        uris: [glasses?.uri],
      },
      {
        key: 'hairstyle',
        title: t('garnet.cardHairstyle'),
        uris: [hairstyle?.uri],
      },
      {
        key: 'accessories',
        title: t('garnet.cardAccessories'),
        uris: [accessories?.uri],
      },
    ];

    if (mode === 'dress') {
      return [
        {
          key: 'dress',
          title: t('garnet.cardDress'),
          uris: [dress?.uri],
        },
        ...commonItems,
      ];
    }

    return [
      {
        key: 'upper',
        title: t('garnet.cardTop'),
        uris: [upper?.uri],
      },
      {
        key: 'lower',
        title: t('garnet.cardBottom'),
        uris: [lower?.uri],
      },
      ...commonItems,
    ];
  }, [
    accessories?.uri,
    dress?.uri,
    glasses?.uri,
    hairstyle?.uri,
    lower?.uri,
    mode,
    t,
    upper?.uri,
  ]);

  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{t('garnet.customOutfitUploadListTitle')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.itemsRow}
      >
        {imagesList.map((item) => (
          <Pressable key={item.key} style={s.itemCard} onPress={goGarnet}>
            <CardWithImage
              title={item.title}
              uris={item.uris}
              notSelectedText={notSelectedText}
            />
          </Pressable>
        ))}
      </ScrollView>

      <BottomModal
        visible={isGarmentOpened}
        onClose={() => setIsGarmentOpened(false)}
        isLoading={isGarmentLoading}
      >
        <GarmentUploader onBusyChange={setIsGarmentLoading} />
      </BottomModal>
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
