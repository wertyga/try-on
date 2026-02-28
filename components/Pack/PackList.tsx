import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { PackListItem } from '@/components/Pack/PackListItem';
import React, { FC } from 'react';
import { Colors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { TCreditPack } from '@/stores/creditStore/credit.types';

export const PackList: FC<{
  packs: TCreditPack[];
  isLoading: boolean;
}> = ({ packs, isLoading }) => {
  const { t } = useTranslation();

  return (
    <View style={{ gap: 12 }}>
      <View style={s.rowBetween}>
        <Text style={s.sectionTitle}>{t('pack.listTitle')}</Text>
        {isLoading ? <ActivityIndicator /> : null}
      </View>

      {!packs.length && (
        <Text style={s.muted}>{t('pack.noPackAvailable')}</Text>
      )}

      {!!packs.length && (
        <View style={{ gap: 10 }}>
          {packs.map((p) => {
            return <PackListItem pack={p} key={p.id} />;
          })}
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  muted: { color: Colors.light.textDisabled, fontWeight: '700' },

  sectionTitle: { fontSize: 16, fontWeight: '900' },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
