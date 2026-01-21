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

export default function TryOn() {
  const credits = useCreditsStore();

  const { t } = useTranslation();

  const { userPhoto, mode, dress, upper, lower } = useTryOnStore();

  const hasGarment = mode === 'dress' ? !!dress : !!upper || !!lower;

  // Build payload from store
  const currentPayload: TryOnPayload | null = useMemo(() => {
    if (!userPhoto?.base64) return null;
    if (mode === 'dress' && !dress?.base64) return null;
    if (mode === 'separate' && !upper?.base64 && !lower?.base64) return null;

    return {
      mode,
      userBase64: userPhoto.base64,
      ...(mode === 'dress'
        ? { dressBase64: dress?.base64 }
        : { upperBase64: upper?.base64, lowerBase64: lower?.base64 }),
    };
  }, [userPhoto, mode, dress, upper, lower]);

  function goWelcome() {
    router.push('/welcome');
  }

  function goGarnet() {
    router.push('/(tabs)/garment');
  }

  useEffect(() => {
    credits.load();
  }, []);

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
            <View style={s.rowBetween}>
              <Text style={s.itemTitle}>{t('home.garment')}</Text>
              <View
                style={[s.chip, mode === 'dress' ? s.chipDark : s.chipLight]}
              >
                <Text
                  style={mode === 'dress' ? s.chipTextDark : s.chipTextLight}
                >
                  {mode === 'dress'
                    ? t('garnet.modeDress')
                    : t('garnet.modeSeparate')}
                </Text>
              </View>
            </View>

            {mode === 'dress' ? (
              dress ? (
                <View style={s.previewFrameWide}>
                  <Image
                    source={{ uri: dress.uri }}
                    style={s.preview}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <Text style={s.muted}>{t('home.noGarment')}</Text>
              )
            ) : (
              <View style={s.separateWrap}>
                <View style={s.separateCard}>
                  <Text style={s.separateTitle}>{t('wardrobe.top')}</Text>
                  {upper ? (
                    <View style={s.previewFrameSmall}>
                      <Image
                        source={{ uri: upper.uri }}
                        style={s.preview}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <Text style={s.mutedSmall}>{t('common.notSelected')}</Text>
                  )}
                </View>
                <View style={s.separateCard}>
                  <Text style={s.separateTitle}>{t('wardrobe.bottom')}</Text>
                  {lower ? (
                    <View style={s.previewFrameSmall}>
                      <Image
                        source={{ uri: lower.uri }}
                        style={s.preview}
                        resizeMode="contain"
                      />
                    </View>
                  ) : (
                    <Text style={s.mutedSmall}>{t('common.notSelected')}</Text>
                  )}
                </View>
              </View>
            )}

            <Text style={s.linkBtnTextInline}>
              {hasGarment ? t('common.change') : t('common.select')}
            </Text>
          </Pressable>

          <View style={s.itemCard}>
            <Text style={s.itemTitle}>Glasses</Text>
            <View style={s.previewFrameWide}>
              <Text style={s.muted}>No glasses selected</Text>
            </View>
            <Text style={s.linkBtnTextInline}>Select</Text>
          </View>

          <View style={s.itemCard}>
            <Text style={s.itemTitle}>Hairstyle</Text>
            <View style={s.previewFrameWide}>
              <Text style={s.muted}>No hairstyle selected</Text>
            </View>
            <Text style={s.linkBtnTextInline}>Select</Text>
          </View>

          <View style={s.itemCard}>
            <Text style={s.itemTitle}>Accessories</Text>
            <View style={s.previewFrameWide}>
              <Text style={s.muted}>No accessories selected</Text>
            </View>
            <Text style={s.linkBtnTextInline}>Select</Text>
          </View>
        </ScrollView>
      </View>

      <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
        <CreditsBadge />
      </View>

      {/* Generate */}
      <GenerateTaskButton currentPayload={currentPayload} />

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
    height: 420,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  linkBtnTextInline: { marginTop: 8, color: '#111827', fontWeight: '700' },
});
