import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useWardrobeStore } from '@/stores/useWardrobeStore';
import { Button } from '@/components/ui/button';
import { getWardrobeItem } from '@/api/wardrobe';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@/analytics';
import { ImageZoom } from '@/components/ImageZoom';
import { ButtonWithConfirm } from '@/components/ButtonWithConfirm';
import { Colors } from '@/constants/Colors';

type WardrobeItem = {
  _id: string;
  title?: string;
  imageUrl: string;
  createdAt: string;
  assets: {
    model: string;
    dress?: string;
    upper?: string;
    lower?: string;
    outfit?: string;
  };
};

export default function WardrobeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const storeItem = useWardrobeStore((s) =>
    s.items.find((it) => it._id === id),
  );

  const removeItem = useWardrobeStore((s) => s.remove);

  const [item, setItem] = useState<WardrobeItem | undefined>(undefined);
  const [loading, setLoading] = useState(!storeItem);

  useEffect(() => {
    setItem(storeItem);

    if (storeItem) {
      Analytics.event('wardrobe_item_open', {
        item_hint: storeItem._id.slice(-6),
      });
    }
  }, [storeItem?._id]);

  // fetch from backend if not in store
  useEffect(() => {
    let cancelled = false;

    async function fetchOne() {
      try {
        setLoading(true);
        const it = await getWardrobeItem(id);
        if (!cancelled) setItem(it);
      } catch {
        if (!cancelled)
          Alert.alert(t('common.error'), t('errors.failedToLoad'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (!storeItem) fetchOne();

    return () => {
      cancelled = true;
    };
  }, [id, storeItem, t]);

  const created = useMemo(() => {
    try {
      return item?.createdAt ? new Date(item.createdAt).toLocaleString() : '';
    } catch {
      return '';
    }
  }, [item?.createdAt]);

  const onDelete = async () => {
    if (!item) return;

    try {
      Analytics.event('wardrobe_item_delete', {
        item_hint: item._id.slice(-6),
      });

      await removeItem(item._id);

      Analytics.event('wardrobe_item_delete_success', {
        item_id: item._id,
      });

      router.replace('/(tabs)/wardrobe');
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message || t('errors.failedToDelete'));
    }
  };

  const onShare = useCallback(async () => {
    if (!item) return;
    try {
      Analytics.event('wardrobe_item_share', { item_hint: item._id.slice(-6) });

      await Share.share({
        message: item.title ? `${item.title}\n${item.imageUrl}` : item.imageUrl,
        url: item.imageUrl,
      });
    } catch {}
  }, [item]);

  if (!id) return null;

  const assets: string[][] = [
    [item?.assets.model, t('wardrobe.model')],
    [item?.assets.outfit, t('wardrobe.outfit')],
    [item?.assets.dress, t('wardrobe.dress')],
    [item?.assets.upper, t('wardrobe.top')],
    [item?.assets.lower, t('wardrobe.bottom')],
  ].filter(([image]) => !!image) as string[][];

  return (
    <Container.WithTabBar
      title={item?.title || t('wardrobe.detailTitle')}
      isLoading={loading}
    >
      {item && (
        <>
          {/* Hero */}
          <ImageZoom
            source={{ uri: item.imageUrl }}
            style={s.heroWrap}
            imageStyle={s.heroImage}
            withDownload
          />

          <Text style={s.muted}>
            {t('wardrobe.createdAt', { date: created })}
          </Text>

          {/* Sources */}
          <View style={s.card}>
            <Text style={s.cardTitle}>{t('wardrobe.sources')}</Text>

            <View style={s.assetsRow}>
              {assets.map(([image, label]) => {
                return <AssetThumb key={image} label={label} uri={image} />;
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <Button fullWidth onPress={onShare} dark>
              {t('common.share')}
            </Button>
            <ButtonWithConfirm
              fullWidth
              transparent
              onPress={onDelete}
              alertText={t('alerts.deleteLookTitle')}
            >
              {t('common.delete')}
            </ButtonWithConfirm>
          </View>
        </>
      )}
    </Container.WithTabBar>
  );
}

function AssetThumb({ label, uri }: { label: string; uri: string }) {
  return (
    <View style={s.asset}>
      <ImageZoom
        source={{ uri }}
        imageStyle={s.assetImg}
        style={{ borderRadius: 0 }}
      />
      <Text numberOfLines={1} style={s.assetLabel}>
        {label}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  heroWrap: {
    aspectRatio: 3 / 4,
    backgroundColor: Colors.light.disabledBg,
    width: '100%',
  },
  heroImage: {
    objectFit: 'contain',
  },

  muted: { color: '#6B7280', marginBottom: 12 },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontWeight: '800', marginBottom: 8 },

  assetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  asset: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  assetImg: { width: '100%', height: '100%', objectFit: 'cover' },
  assetLabel: {
    textAlign: 'center',
    fontSize: 12,
    paddingTop: 2,
    paddingBottom: 5,
    color: '#111827',
  },

  actions: { gap: 10, marginTop: 24, marginBottom: 12 },
});
