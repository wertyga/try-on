import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { TryOnPayload, useTryOnStore } from '@/stores/useTryOnStore';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { ReccomendationProducts } from '@/components/ReccomendationProducts';
import { GenerateTaskButton } from '@/components/tryon';
import { useCreditsStore } from '@/stores/creditStore';
import { CreditsBadge } from '@/components/CreditsBadge';
import { CardWithImage } from '@/components/CardWithImage';

export default function TryOn() {
  const credits = useCreditsStore();

  const { t } = useTranslation();

  const {
    userPhoto,
    mode,
    dress,
    upper,
    lower,
    glasses,
    hairstyle,
    accessories,
  } = useTryOnStore();

  function goWelcome() {
    router.push('/welcome');
  }

  function goGarnet() {
    router.push('/(tabs)/garment');
  }

  useEffect(() => {
    credits.load();
  }, []);

  const notSelectedText = t('common.notSelected');

  return (
    <Container.WithTabBar
      keyboardShouldPersistTaps="handled"
      title={t('home.title')}
    >
      {/*/!* Your photo *!/*/}
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('home.yourPhoto')}</Text>
        {userPhoto ? (
          <View style={s.previewFrame}>
            <Image
              source={{ uri: userPhoto.uri }}
              style={s.preview}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Text style={s.muted}>{t('home.noPhoto')}</Text>
        )}
        <Pressable style={s.linkBtn} onPress={goWelcome}>
          <Text style={s.linkBtnText}>
            {userPhoto ? t('home.changePhoto') : t('home.addPhoto')}
          </Text>
        </Pressable>
      </View>

      {/*/!* Try-on items *!/*/}
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
                mode === 'dress'
                  ? []
                  : [t('wardrobe.top'), t('wardrobe.bottom')]
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

      <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
        <CreditsBadge />
      </View>

      {/* Generate */}
      <GenerateTaskButton />

      <ReccomendationProducts />
    </Container.WithTabBar>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },

  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderColor: Colors.light.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  muted: { color: '#6B7280' },
  mutedSmall: { color: '#9CA3AF', fontSize: 12 },

  linkBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  linkBtnText: { color: '#111827', fontWeight: '700' },

  previewFrame: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  previewFrameWide: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFrameSmall: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  chipDark: { backgroundColor: '#111827' },
  chipLight: { backgroundColor: '#E5E7EB' },
  chipTextDark: { color: '#fff', fontWeight: '700', fontSize: 12 },
  chipTextLight: { color: '#111827', fontWeight: '700', fontSize: 12 },

  separateWrap: { flexDirection: 'row', gap: 12 },
  separateCard: { flex: 1 },
  separateTitle: { fontWeight: '700', marginBottom: 6 },
  itemsRow: { gap: 12, paddingRight: 6 },
  itemCard: {
    width: 260,
  },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  linkBtnTextInline: { marginTop: 8, color: '#111827', fontWeight: '700' },
});
