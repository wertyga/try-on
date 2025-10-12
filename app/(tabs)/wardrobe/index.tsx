import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { Container } from '@/components/ui/Container';
import { useWardrobeStore } from '@/hooks/useWardrobeStore';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@/analytics';

export default function WardrobeScreen() {
  const { t } = useTranslation();

  const items = useWardrobeStore((s) => s.items);
  const isLoading = useWardrobeStore((s) => s.isLoading);
  const fetchMine = useWardrobeStore((s) => s.fetchMine);
  const removeItem = useWardrobeStore((s) => s.remove);

  useEffect(() => {
    if (!items?.length) fetchMine().catch(() => {});

    Analytics.event('wardrobe_open');
  }, []);

  const { width } = useWindowDimensions();
  const gap = 12;
  const horizontalPadding = 16;
  const cols = 2;
  const card = Math.floor(
    (width - horizontalPadding * 2 - gap * (cols - 1)) / cols,
  );

  const onRefresh = useCallback(() => {
    fetchMine().catch(() => {});
  }, [fetchMine]);

  const askDelete = (id: string) => {
    Alert.alert(t('alerts.deleteLookTitle'), t('alerts.deleteLookText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          Analytics.event('wardrobe_item_delete_click', { item_id: id });

          removeItem(id)
            .then(() => {
              Analytics.event('wardrobe_item_delete_success', { item_id: id });
            })
            .catch((e) =>
              Alert.alert(
                t('common.error'),
                e?.message || t('errors.failedToDelete'),
              ),
            );
        },
      },
    ]);
  };

  return (
    <Container.WithTabBar
      title={t('wardrobe.title')}
      isLoading={isLoading}
      refreshControl={
        <RefreshControl refreshing={!!isLoading} onRefresh={onRefresh} />
      }
    >
      {items.length === 0 && !isLoading ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>{t('wardrobe.emptyTitle')}</Text>
          <Text style={s.emptyText}>{t('wardrobe.emptyText')}</Text>
          <Pressable
            style={s.primaryBtn}
            onPress={() => router.push('/(tabs)/try-on')}
          >
            <Text style={s.primaryBtnText}>{t('wardrobe.makeTryOn')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[s.grid, { gap }]}>
          {items.map((item) => (
            <Pressable
              key={item._id}
              style={[s.card, { width: card }]}
              onPress={() => router.push(`/(tabs)/wardrobe/${item._id}`)}
              onLongPress={() => askDelete(item._id)}
            >
              <Image source={{ uri: item.imageUrl }} style={s.thumb} />
              <View style={s.overlay}>
                <Text numberOfLines={1} style={s.date}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Container.WithTabBar>
  );
}

function formatDate(d?: string) {
  try {
    return d ? new Date(d).toLocaleDateString() : '';
  } catch {
    return '';
  }
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  thumb: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  date: { color: '#fff', fontSize: 12 },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { color: '#6B7280', textAlign: 'center', marginHorizontal: 8 },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '90%', height: '90%' },
});
