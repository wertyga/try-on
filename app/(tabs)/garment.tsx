import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';

import { Container } from '@/components/ui/Container';
import { TTryOnImagesKeys, useTryOnStore } from '@/stores/useTryOnStore';
import { ReccomendationProducts } from '@/components/ReccomendationProducts';
import { UploadItem } from '@/components/UploadItem';

export default function Garment() {
  const { t } = useTranslation();

  const {
    mode,
    setMode,
    dress,
    upper,
    lower,
    glasses,
    hairstyle,
    accessories,
    setImage,
    clearImage,
  } = useTryOnStore();

  const [busy, setBusy] = useState(false);

  const clear = (slot: TTryOnImagesKeys) => {
    clearImage(slot);
  };

  async function pick(slot: TTryOnImagesKeys) {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          t('permissions.required'),
          // платформенный текст уже есть в en.json (photos.ios / photos.android)
          Platform.select({
            ios: t('permissions.photos.ios'),
            android: t('permissions.photos.android'),
          }) as string,
        );
        return;
      }

      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (r.canceled) return;

      setBusy(true);
      const a = r.assets[0];
      const manip = await ImageManipulator.manipulateAsync(a.uri, [], {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });

      setImage(slot, {
        uri: manip.uri,
        base64: `data:image/jpeg;base64,${manip.base64!}`,
      });
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.message || t('errors.pickImageFallback'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container.WithTabBar title={t('garnet.title')}>
      {/* Mode switch */}
      <View style={s.switchRow}>
        <Pressable
          onPress={() => setMode('dress')}
          style={[s.switchBtn, mode === 'dress' && s.switchBtnActive]}
        >
          <Text style={[s.switchText, mode === 'dress' && s.switchTextActive]}>
            {t('garnet.modeDress')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('separate')}
          style={[s.switchBtn, mode === 'separate' && s.switchBtnActive]}
        >
          <Text
            style={[s.switchText, mode === 'separate' && s.switchTextActive]}
          >
            {t('garnet.modeSeparate')}
          </Text>
        </Pressable>
      </View>

      {mode === 'dress' ? (
        <UploadItem
          title={t('garnet.cardDress')}
          imageUri={dress?.uri}
          onPick={() => pick('dress')}
          onClear={() => clear('dress')}
        />
      ) : (
        <>
          <UploadItem
            title={t('garnet.cardTop')}
            imageUri={upper?.uri}
            onPick={() => pick('upper')}
            onClear={() => clear('upper')}
          />
          <UploadItem
            title={t('garnet.cardBottom')}
            imageUri={lower?.uri}
            onPick={() => pick('lower')}
            onClear={() => clear('lower')}
          />
        </>
      )}

      <UploadItem
        title={t('garnet.cardGlasses')}
        imageUri={glasses?.uri}
        onPick={() => pick('glasses')}
        onClear={() => clear('glasses')}
      />
      <UploadItem
        title={t('garnet.cardHairstyle')}
        imageUri={hairstyle?.uri}
        onPick={() => pick('hairstyle')}
        onClear={() => clear('hairstyle')}
      />
      <UploadItem
        title={t('garnet.cardAccessories')}
        imageUri={accessories?.uri}
        onPick={() => pick('accessories')}
        onClear={() => clear('accessories')}
      />

      {busy && <ActivityIndicator size="large" style={{ marginTop: 8 }} />}

      <Text style={s.hint}>{t('garnet.tip')}</Text>

      <ReccomendationProducts />
    </Container.WithTabBar>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  switchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  switchBtnActive: { backgroundColor: '#111827' },
  switchText: { color: '#111827', fontWeight: '700' },
  switchTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  muted: { color: '#6B7280' },

  previewFrame: {
    width: '100%',
    height: 360,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },

  primaryBtn: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  clearBtn: {
    backgroundColor: '#FFE4E6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  clearBtnText: { color: '#991B1B', fontWeight: '700' },

  hint: { color: '#6B7280', marginTop: 4 },
});
