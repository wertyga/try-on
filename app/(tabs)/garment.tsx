import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';

import { Container } from '@/components/ui/Container';
import { useTryOnStore } from '@/hooks/useTryOnStore';
import { Analytics } from '@/analytics';

export default function Garment() {
  const { t } = useTranslation();

  const {
    mode,
    setMode,
    dress,
    upper,
    lower,
    setDress,
    setUpper,
    setLower,
    clearDress,
    clearUpper,
    clearLower,
  } = useTryOnStore();

  const [busy, setBusy] = useState(false);

  const clear = (slot: 'dress' | 'upper' | 'lower', setter: () => void) => {
    Analytics.event('garment_clear', { slot });
    setter();
  };

  async function pick(
    slot: 'dress' | 'upper' | 'lower',
    setter: (x: { uri: string; base64: string } | null) => void,
  ) {
    try {
      Analytics.event('garment_pick_start', { slot });

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
      setter({
        uri: manip.uri,
        base64: `data:image/jpeg;base64,${manip.base64!}`,
      });

      Analytics.event('garment_pick_success', { slot });
    } catch (e: any) {
      Analytics.event('garment_pick_error', { slot });

      Alert.alert(
        t('common.error'),
        e?.message || t('errors.pickImageFallback'),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container.WithScrollBar>
      <Text style={s.title}>{t('garnet.title')}</Text>

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
        <Card
          title={t('garnet.cardDress')}
          imageUri={dress?.uri}
          onPick={() => pick('dress', setDress)}
          onClear={() => clear('dress', clearDress)}
        />
      ) : (
        <>
          <Card
            title={t('garnet.cardTop')}
            imageUri={upper?.uri}
            onPick={() => pick('upper', setUpper)}
            onClear={() => clear('upper', clearUpper)}
          />
          <Card
            title={t('garnet.cardBottom')}
            imageUri={lower?.uri}
            onPick={() => pick('lower', setLower)}
            onClear={() => clear('lower', clearLower)}
          />
        </>
      )}

      {busy && <ActivityIndicator size="large" style={{ marginTop: 8 }} />}

      <Text style={s.hint}>{t('garnet.tip')}</Text>
    </Container.WithScrollBar>
  );
}

function Card({
  title,
  imageUri,
  onPick,
  onClear,
}: {
  title: string;
  imageUri?: string;
  onPick: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>

      {imageUri ? (
        <View style={s.previewFrame}>
          <Image
            source={{ uri: imageUri }}
            style={s.preview}
            resizeMode="contain"
          />
        </View>
      ) : (
        <Text style={s.muted}>{t('garnet.noImage')}</Text>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Pressable style={s.primaryBtn} onPress={onPick}>
          <Text style={s.primaryBtnText}>
            {imageUri ? t('garnet.replace') : t('garnet.upload')}
          </Text>
        </Pressable>
        {imageUri && (
          <Pressable style={s.clearBtn} onPress={onClear}>
            <Text style={s.clearBtnText}>{t('garnet.clear')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
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
