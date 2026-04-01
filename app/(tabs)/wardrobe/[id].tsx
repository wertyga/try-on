import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Share,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { createTaskBySample } from '@/api';
import { Container } from '@/components/ui/Container';
import { useWardrobeStore } from '@/stores/useWardrobeStore';
import { Button } from '@/components/ui/button';
import { getWardrobeItem } from '@/api/wardrobe';
import { useTranslation } from 'react-i18next';
import { ImageZoom } from '@/components/ImageZoom';
import { ButtonWithConfirm } from '@/components/ButtonWithConfirm';
import { Colors } from '@/constants/Colors';
import { DownloadImageButton } from '@/components/DownloadImageButton';
import { MaterialIcons } from '@expo/vector-icons';
import { PresetsList, TryOnSamplesList } from '@/components/tryon';
import {
  TTryOnPreset,
  TTryOnSample,
  useTryOnPresetsStore,
  useTryOnStore,
} from '@/stores';
import { useCreditsStore } from '@/stores/creditStore';
import { getTryOnTaskFromTask } from '@/utils';
import { hash } from '@/utils/hash';
import {
  trackCreditSpent,
  trackSampleClicked,
  trackStudioPresetClicked,
  trackTaskCreated,
} from '@/analytics';

type WardrobeItem = {
  _id: string;
  user?: string;
  title?: string;
  imageUrl: string;
  createdAt: string;
  sample?: {
    image?: string;
    title?: string;
  };
  preset?: {
    image?: string;
    title?: string;
  };
  mode?: 'dress' | 'separate' | 'preset' | 'sample';
  assets: {
    model: string;
    dress?: string;
    upper?: string;
    lower?: string;
    outfit?: string;
    preset?: string;
    glasses?: string;
    hairstyle?: string;
    accessories?: string;
  };
};

export default function WardrobeDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: windowHeight } = useWindowDimensions();
  const credits = useCreditsStore();
  const addTask = useTryOnStore((s) => s.addTask);
  const creatingPresetId = useTryOnPresetsStore((s) => s.creatingPresetId);
  const createTaskWithPreset = useTryOnPresetsStore(
    (s) => s.createTaskWithPreset,
  );

  const storeItem = useWardrobeStore((s) =>
    s.items.find((it) => it._id === id),
  );

  const removeItem = useWardrobeStore((s) => s.remove);

  const [item, setItem] = useState<WardrobeItem | undefined>(undefined);
  const [loading, setLoading] = useState(!storeItem);
  const [creatingSampleId, setCreatingSampleId] = useState<string | null>(null);

  useEffect(() => {
    setItem(storeItem);
  }, [storeItem?._id]);

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
      await removeItem(item._id);

      router.replace('/wardrobe');
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.message || t('errors.failedToDelete'));
    }
  };

  const onShare = useCallback(async () => {
    if (!item) return;
    try {
      await Share.share({
        message: item.title ? `${item.title}\n${item.imageUrl}` : item.imageUrl,
        url: item.imageUrl,
      });
    } catch {}
  }, [item]);

  const handleSampleSelect = (sample: TTryOnSample) => {
    if (!item) return;

    trackSampleClicked(sample._id);

    Alert.alert(t('samples.confirmTitle'), t('samples.confirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: async () => {
          await credits.load();

          if (!credits.canGenerate(true)) return;

          const reservationId = credits.beginGenerationReservation();

          try {
            setCreatingSampleId(sample._id);

            const { task } = await createTaskBySample({
              sampleId: sample._id,
              mode: 'sample',
              userBase64: item.imageUrl,
            });

            addTask(
              {
                ...getTryOnTaskFromTask(
                task,
                `${sample._id}|${hash(item.imageUrl)}`,
                false,
                ),
                usesPaidCreditReservation: !!reservationId,
              },
            );

            await credits.onGenerationStarted(reservationId, task._id);
            trackTaskCreated('sample', task._id);
            trackCreditSpent('sample', task._id);

            router.push(`/task/${task._id}`);
          } catch (e: any) {
            credits.releaseGenerationReservation(reservationId);
            Alert.alert(
              t('common.error'),
              e?.message || t('errors.failedToCreate'),
            );
          } finally {
            setCreatingSampleId(null);
          }
        },
      },
    ]);
  };

  const handlePresetSelect = (preset: TTryOnPreset) => {
    if (!item) return;

    trackStudioPresetClicked(preset._id);

    Alert.alert(t('presets.confirmTitle'), t('presets.confirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        onPress: async () => {
          await credits.load();

          if (!credits.canGenerate(true)) return;

          try {
            const task = await createTaskWithPreset({
              presetId: preset._id,
              image: item.imageUrl,
              presetImage: preset.image,
            });

            if (task) {
              router.push(`/task/${task._id}`);
            }
          } catch (e: any) {
            Alert.alert(
              t('common.error'),
              e?.message || t('errors.failedToCreate'),
            );
          }
        },
      },
    ]);
  };

  if (!id) return null;

  const assets: string[][] = [
    [item?.assets?.outfit, t('wardrobe.outfit')],
    [item?.assets?.dress, t('wardrobe.dress')],
    [item?.assets?.upper, t('wardrobe.top')],
    [item?.assets?.lower, t('wardrobe.bottom')],
    [item?.assets?.glasses, t('wardrobe.glasses')],
    [item?.assets?.hairstyle, t('wardrobe.hairstyle')],
    [item?.assets?.accessories, t('wardrobe.accessories')],
  ].filter(([image]) => !!image) as string[][];

  if (item?.assets?.model) {
    assets.unshift([item.assets.model, t('wardrobe.model')]);
  }

  if (item?.sample?.image) {
    assets.splice(1, 0, [
      item.sample.image,
      item.sample.title || t('wardrobe.sample'),
    ]);
  }

  if (item?.preset?.image) {
    assets.splice(2, 0, [
      item.preset.image,
      item.preset.title || t('wardrobe.preset'),
    ]);
  }

  const minContentHeight = Math.max(420, windowHeight - 240);

  return (
    <Container.WithTabBar
      title={item?.title || t('wardrobe.detailTitle')}
      isLoading={loading}
      childrenStyle={s.containerInner}
    >
      {item && (
        <View style={[s.content, { minHeight: minContentHeight }]}>
          <View style={s.heroWrap}>
            <ImageZoom
              source={{ uri: item.imageUrl }}
              style={s.heroImageWrap}
              imageStyle={s.heroImage}
            />

            <View style={s.actions}>
              <ButtonWithConfirm
                dark
                style={s.actionButton}
                onPress={onDelete}
                alertText={t('alerts.deleteLookTitle')}
              >
                <MaterialIcons name="delete-outline" size={24} color="#fff" />
              </ButtonWithConfirm>

              <DownloadImageButton
                imageUrl={item.imageUrl}
                style={s.actionButton}
              />

              <Button dark style={s.actionButton} onPress={onShare}>
                <MaterialIcons name="share" size={22} color="#fff" />
              </Button>
            </View>
          </View>

          <Text style={s.muted}>
            {t('wardrobe.createdAt', { date: created })}
          </Text>

          <View style={s.card}>
            <Text style={s.cardTitle}>{t('wardrobe.sources')}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.assetsRow}
            >
              {assets.map(([image, label]) => {
                return <AssetThumb key={image} label={label} uri={image} />;
              })}
            </ScrollView>
          </View>

          <TryOnSamplesList
            selectedSampleId={creatingSampleId ?? undefined}
            onSelectSample={handleSampleSelect}
          />

          <PresetsList
            title={t('presets.sectionTitle')}
            disabledPresetId={creatingPresetId}
            onSelectPreset={handlePresetSelect}
          />
        </View>
      )}
    </Container.WithTabBar>
  );
}

function AssetThumb({ label, uri }: { label: string; uri: string }) {
  const { width: windowWidth } = useWindowDimensions();

  return (
    <View style={[s.asset, { width: windowWidth / 3 - 30 }]}>
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
  containerInner: {
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 12,
  },
  heroWrap: {
    gap: 12,
  },
  heroImageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  muted: {
    color: Colors.light.textLight,
    fontSize: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  cardTitle: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '700',
  },
  assetsRow: {
    gap: 12,
    paddingRight: 8,
  },
  asset: {
    gap: 8,
  },
  assetImg: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
  },
  assetLabel: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
