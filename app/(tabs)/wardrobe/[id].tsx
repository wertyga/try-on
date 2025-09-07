import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';
import { Button } from '@/components/ui/button';
import { getWardrobeItem } from '@/api/wardrobe';
import { useTranslation } from 'react-i18next';

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
  };
};

export default function WardrobeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const storeItems = useWardrobeStore((s) => s.items);
  const storeItem = storeItems.find((ti) => ti._id === id);

  const removeItem = useWardrobeStore((s) => s.remove);
  const [item, setItem] = useState<WardrobeItem | undefined>(undefined);
  const [loading, setLoading] = useState(!storeItem);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setItem(storeItem);
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

  const onDelete = useCallback(() => {
    if (!item) return;
    Alert.alert(t('alerts.deleteLookTitle'), t('alerts.deleteLookText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await removeItem(item._id);
            router.replace('/(tabs)/wardrobe');
          } catch (e: any) {
            Alert.alert(
              t('common.error'),
              e?.message || t('errors.failedToDelete'),
            );
          }
        },
      },
    ]);
  }, [item, removeItem, t]);

  const onShare = useCallback(async () => {
    if (!item) return;
    try {
      await Share.share({
        message: item.title ? `${item.title}\n${item.imageUrl}` : item.imageUrl,
        url: item.imageUrl,
      });
    } catch {}
  }, [item]);

  if (!id) return null;

  return (
    <Container.WithScrollBar
      title={item?.title || t('wardrobe.detailTitle')}
      isLoading={loading}
    >
      {item && (
        <>
          {/* Hero */}
          <Pressable
            onPress={() => setPreview(item.imageUrl)}
            style={s.heroWrap}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={s.hero}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={s.muted}>
            {t('wardrobe.createdAt', { date: created })}
          </Text>

          {/* Sources */}
          <View style={s.card}>
            <Text style={s.cardTitle}>{t('wardrobe.sources')}</Text>
            <View style={s.assetsRow}>
              <AssetThumb
                label={t('wardrobe.model')}
                uri={item.assets.model}
                onOpen={setPreview}
              />
              {!!item.assets.dress && (
                <AssetThumb
                  label={t('wardrobe.dress')}
                  uri={item.assets.dress}
                  onOpen={setPreview}
                />
              )}
              {!!item.assets.upper && (
                <AssetThumb
                  label={t('wardrobe.top')}
                  uri={item.assets.upper}
                  onOpen={setPreview}
                />
              )}
              {!!item.assets.lower && (
                <AssetThumb
                  label={t('wardrobe.bottom')}
                  uri={item.assets.lower}
                  onOpen={setPreview}
                />
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <Button fullWidth onPress={onShare}>
              {t('common.share')}
            </Button>
            <Button fullWidth transparent onPress={onDelete}>
              {t('common.delete')}
            </Button>
          </View>
        </>
      )}

      {/* Preview modal */}
      <Modal
        visible={!!preview}
        transparent
        onRequestClose={() => setPreview(null)}
      >
        <Pressable style={s.modal} onPress={() => setPreview(null)}>
          {!!preview && (
            <Image
              source={{ uri: preview }}
              style={s.preview}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>
    </Container.WithScrollBar>
  );
}

function AssetThumb({
  label,
  uri,
  onOpen,
}: {
  label: string;
  uri: string;
  onOpen: (u: string) => void;
}) {
  return (
    <Pressable style={s.asset} onPress={() => onOpen(uri)}>
      <Image source={{ uri }} style={s.assetImg} />
      <Text numberOfLines={1} style={s.assetLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  heroWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  hero: { width: '100%', height: '100%' },

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
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  assetImg: { width: '100%', height: '80%' },
  assetLabel: {
    textAlign: 'center',
    fontSize: 12,
    paddingTop: 2,
    color: '#111827',
  },

  actions: { gap: 10, marginTop: 4, marginBottom: 12 },

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '90%', height: '90%' },
});
